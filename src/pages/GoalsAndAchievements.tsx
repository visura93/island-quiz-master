import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Target,
  Trophy,
  Flame,
  Star,
  Zap,
  BookOpen,
  Crown,
  GraduationCap,
  TrendingUp,
  Moon,
  Rocket,
  Lock,
  CheckCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiService, QuizAttempt, StreakInfo } from "@/lib/api";
import { getMockStreakInfo } from "@/lib/mockLeaderboardData";
import {
  type StudyGoal,
  type GoalType,
  type GoalPeriod,
  getActiveGoals,
  getCompletedGoals,
  createGoal,
  deleteGoal,
  refreshGoalProgress,
  isGoalExpired,
  cleanExpiredGoals,
} from "@/lib/goalsStore";
import {
  type BadgeProgress,
  type BadgeRarity,
  evaluateBadges,
  getUnseenBadges,
  markBadgesSeen,
  RARITY_STYLES,
} from "@/lib/badgesEngine";
import { useToast } from "@/hooks/use-toast";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Rocket, BookOpen, Crown, Star, TrendingUp, GraduationCap,
  Flame, Zap, Moon, Target, Trophy,
};

const RARITY_LABELS: Record<BadgeRarity, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

const GoalsAndAchievements = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [activeGoals, setActiveGoals] = useState<StudyGoal[]>([]);
  const [completedGoalsList, setCompletedGoalsList] = useState<StudyGoal[]>([]);
  const [badges, setBadges] = useState<BadgeProgress[]>([]);
  const [quizzes, setQuizzes] = useState<QuizAttempt[]>([]);
  const [streak, setStreak] = useState<StreakInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCompletedGoals, setShowCompletedGoals] = useState(false);
  const [celebrateBadge, setCelebrateBadge] = useState<BadgeProgress | null>(null);

  const [newGoalType, setNewGoalType] = useState<GoalType>("quiz_count");
  const [newGoalTarget, setNewGoalTarget] = useState("");
  const [newGoalSubject, setNewGoalSubject] = useState("");
  const [newGoalPeriod, setNewGoalPeriod] = useState<GoalPeriod>("weekly");

  const subjects = useMemo(() => {
    const unique = new Set(quizzes.map((q) => q.subject));
    return Array.from(unique).sort();
  }, [quizzes]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      cleanExpiredGoals();

      const [quizData, streakData] = await Promise.allSettled([
        apiService.getCompletedQuizzes(),
        apiService.getStreakInfo(),
      ]);

      const resolvedQuizzes = quizData.status === "fulfilled" ? quizData.value : [];
      const resolvedStreak = streakData.status === "fulfilled" ? streakData.value : getMockStreakInfo();

      setQuizzes(resolvedQuizzes);
      setStreak(resolvedStreak);

      refreshGoalProgress(resolvedQuizzes, resolvedStreak);
      setActiveGoals(getActiveGoals());
      setCompletedGoalsList(getCompletedGoals());

      const badgeResults = evaluateBadges(resolvedQuizzes, resolvedStreak);
      setBadges(badgeResults);

      const unseen = getUnseenBadges();
      if (unseen.length > 0) {
        const firstUnseen = badgeResults.find((b) => unseen.includes(b.badge.id) && b.earned);
        if (firstUnseen) setCelebrateBadge(firstUnseen);
        markBadgesSeen(unseen);
      }
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = () => {
    const target = parseInt(newGoalTarget, 10);
    if (!target || target <= 0) {
      toast({ title: "Invalid target", description: "Please enter a valid target number.", variant: "destructive" });
      return;
    }

    const goal = createGoal({
      type: newGoalType,
      target,
      subject: newGoalType === "score_target" ? newGoalSubject || undefined : undefined,
      period: newGoalPeriod,
    });

    if (!goal) {
      toast({ title: "Limit reached", description: "You can have at most 5 active goals.", variant: "destructive" });
      return;
    }

    refreshGoalProgress(quizzes, streak);
    setActiveGoals(getActiveGoals());
    const updatedBadges = evaluateBadges(quizzes, streak);
    setBadges(updatedBadges);

    setShowCreateDialog(false);
    setNewGoalTarget("");
    setNewGoalSubject("");
    toast({ title: "Goal created", description: goal.title });
  };

  const handleDeleteGoal = (id: string) => {
    deleteGoal(id);
    setActiveGoals(getActiveGoals());
    setCompletedGoalsList(getCompletedGoals());
  };

  const getGoalIcon = (type: GoalType) => {
    switch (type) {
      case "quiz_count": return <BookOpen className="h-5 w-5" />;
      case "score_target": return <Target className="h-5 w-5" />;
      case "streak": return <Flame className="h-5 w-5" />;
    }
  };

  const getGoalColor = (type: GoalType) => {
    switch (type) {
      case "quiz_count": return "text-blue-600 dark:text-blue-400";
      case "score_target": return "text-green-600 dark:text-green-400";
      case "streak": return "text-orange-600 dark:text-orange-400";
    }
  };

  const getProgressPercent = (goal: StudyGoal) => {
    if (goal.target <= 0) return 0;
    return Math.min(100, Math.round((goal.current / goal.target) * 100));
  };

  const renderBadgeIcon = (iconName: string, className?: string) => {
    const Icon = ICON_MAP[iconName];
    return Icon ? <Icon className={className} /> : <Star className={className} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center space-y-3">
          <Trophy className="h-12 w-12 mx-auto text-primary/50" />
          <p className="text-muted-foreground">Loading your achievements...</p>
        </div>
      </div>
    );
  }

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/student-dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Goals & Achievements
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your progress and collect badges
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="border-2 bg-gradient-card">
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{activeGoals.length}</p>
              <p className="text-xs text-muted-foreground">Active Goals</p>
            </CardContent>
          </Card>
          <Card className="border-2 bg-gradient-card">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{completedGoalsList.length}</p>
              <p className="text-xs text-muted-foreground">Goals Completed</p>
            </CardContent>
          </Card>
          <Card className="border-2 bg-gradient-card">
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 mx-auto mb-2 text-amber-500" />
              <p className="text-2xl font-bold">{earnedCount}/{badges.length}</p>
              <p className="text-xs text-muted-foreground">Badges Earned</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="goals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="goals" className="gap-2">
              <Target className="h-4 w-4" />
              Study Goals
            </TabsTrigger>
            <TabsTrigger value="badges" className="gap-2">
              <Trophy className="h-4 w-4" />
              Badges
              {earnedCount > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                  {earnedCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ─── Goals Tab ─── */}
          <TabsContent value="goals" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Active Goals</h2>
              <Button
                onClick={() => setShowCreateDialog(true)}
                disabled={activeGoals.length >= 5}
                className="gap-2 bg-gradient-hero hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                Add Goal
              </Button>
            </div>

            {activeGoals.length === 0 ? (
              <Card className="border-2 border-dashed">
                <CardContent className="py-12 text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold mb-2">No active goals</h3>
                  <p className="text-muted-foreground mb-4">
                    Set a study goal to stay motivated and track your progress.
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Your First Goal
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {activeGoals.map((goal) => {
                  const pct = getProgressPercent(goal);
                  const expired = isGoalExpired(goal);
                  return (
                    <Card
                      key={goal.id}
                      className={`border-2 transition-all ${expired ? "opacity-60 border-destructive/30" : "hover:shadow-md"}`}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-muted ${getGoalColor(goal.type)}`}>
                              {getGoalIcon(goal.type)}
                            </div>
                            <div>
                              <h3 className="font-semibold">{goal.title}</h3>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                <Clock className="h-3 w-3" />
                                <span className="capitalize">{goal.period}</span>
                                <span>·</span>
                                <span>
                                  Ends {new Date(goal.endDate).toLocaleDateString()}
                                </span>
                                {expired && (
                                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0 ml-1">
                                    Expired
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteGoal(goal.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {goal.current} / {goal.target}
                              {goal.type === "score_target" ? "%" : ""}
                            </span>
                            <span className="font-semibold">{pct}%</span>
                          </div>
                          <Progress value={pct} className="h-2.5" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Completed Goals */}
            {completedGoalsList.length > 0 && (
              <div className="space-y-3">
                <button
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowCompletedGoals(!showCompletedGoals)}
                >
                  <CheckCircle className="h-4 w-4" />
                  Completed Goals ({completedGoalsList.length})
                  <span className="text-xs">{showCompletedGoals ? "▲" : "▼"}</span>
                </button>
                {showCompletedGoals && (
                  <div className="space-y-3">
                    {completedGoalsList.map((goal) => (
                      <Card key={goal.id} className="border bg-muted/30">
                        <CardContent className="p-4 flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-through text-muted-foreground">{goal.title}</p>
                            {goal.completedAt && (
                              <p className="text-xs text-muted-foreground">
                                Completed {new Date(goal.completedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0"
                            onClick={() => handleDeleteGoal(goal.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* ─── Badges Tab ─── */}
          <TabsContent value="badges" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Achievement Badges</h2>
              <p className="text-sm text-muted-foreground">
                {earnedCount} of {badges.length} unlocked
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {badges.map((bp) => {
                const style = RARITY_STYLES[bp.badge.rarity];
                return (
                  <Card
                    key={bp.badge.id}
                    className={`border-2 transition-all overflow-hidden ${
                      bp.earned
                        ? `${style.border} ${style.bg} hover:shadow-lg ${style.glow ? `shadow-md ${style.glow}` : ""}`
                        : "border-muted bg-muted/20 opacity-70"
                    }`}
                  >
                    <CardContent className="p-4 text-center space-y-3">
                      <div
                        className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center ${
                          bp.earned
                            ? `${style.bg} ${style.border} border-2`
                            : "bg-muted border-2 border-muted-foreground/20"
                        }`}
                      >
                        {bp.earned ? (
                          renderBadgeIcon(bp.badge.icon, `h-7 w-7 ${style.text}`)
                        ) : (
                          <Lock className="h-6 w-6 text-muted-foreground/40" />
                        )}
                      </div>

                      <div>
                        <h3 className={`font-semibold text-sm ${bp.earned ? "" : "text-muted-foreground"}`}>
                          {bp.badge.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {bp.earned ? bp.badge.description : bp.badge.lockedDescription}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-1.5 py-0 ${bp.earned ? style.text : "text-muted-foreground"}`}
                        >
                          {RARITY_LABELS[bp.badge.rarity]}
                        </Badge>

                        {bp.earned && bp.unlockedAt ? (
                          <p className="text-[10px] text-muted-foreground">
                            Unlocked {new Date(bp.unlockedAt).toLocaleDateString()}
                          </p>
                        ) : (
                          <div className="space-y-1">
                            <Progress
                              value={(bp.progressValue / bp.progressMax) * 100}
                              className="h-1.5"
                            />
                            <p className="text-[10px] text-muted-foreground">{bp.progressLabel}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Goal Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create a Study Goal</DialogTitle>
            <DialogDescription>
              Set a target and track your progress automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Goal Type</Label>
              <Select
                value={newGoalType}
                onValueChange={(v) => setNewGoalType(v as GoalType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quiz_count">
                    <span className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-500" />
                      Complete Quizzes
                    </span>
                  </SelectItem>
                  <SelectItem value="score_target">
                    <span className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-500" />
                      Achieve Score Target
                    </span>
                  </SelectItem>
                  <SelectItem value="streak">
                    <span className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-orange-500" />
                      Build a Streak
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                {newGoalType === "quiz_count"
                  ? "Number of Quizzes"
                  : newGoalType === "score_target"
                  ? "Target Score (%)"
                  : "Streak Days"}
              </Label>
              <Input
                type="number"
                min="1"
                max={newGoalType === "score_target" ? "100" : "999"}
                placeholder={
                  newGoalType === "quiz_count"
                    ? "e.g. 5"
                    : newGoalType === "score_target"
                    ? "e.g. 80"
                    : "e.g. 7"
                }
                value={newGoalTarget}
                onChange={(e) => setNewGoalTarget(e.target.value)}
              />
            </div>

            {newGoalType === "score_target" && (
              <div className="space-y-2">
                <Label>Subject (optional)</Label>
                <Select value={newGoalSubject} onValueChange={setNewGoalSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="All subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All subjects</SelectItem>
                    {subjects.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Time Period</Label>
              <Select
                value={newGoalPeriod}
                onValueChange={(v) => setNewGoalPeriod(v as GoalPeriod)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">This Week</SelectItem>
                  <SelectItem value="monthly">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateGoal} className="gap-2 bg-gradient-hero hover:opacity-90">
              <Plus className="h-4 w-4" />
              Create Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Badge Celebration Dialog */}
      <Dialog open={!!celebrateBadge} onOpenChange={() => setCelebrateBadge(null)}>
        <DialogContent className="max-w-sm text-center">
          {celebrateBadge && (
            <>
              <div className="pt-4 space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-amber-200/30 to-purple-200/30 animate-ping" />
                  </div>
                  <div
                    className={`relative mx-auto w-20 h-20 rounded-full flex items-center justify-center border-3 ${
                      RARITY_STYLES[celebrateBadge.badge.rarity].border
                    } ${RARITY_STYLES[celebrateBadge.badge.rarity].bg}`}
                  >
                    {renderBadgeIcon(
                      celebrateBadge.badge.icon,
                      `h-10 w-10 ${RARITY_STYLES[celebrateBadge.badge.rarity].text}`
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    <h2 className="text-xl font-bold">Badge Unlocked!</h2>
                    <Sparkles className="h-5 w-5 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-semibold">{celebrateBadge.badge.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {celebrateBadge.badge.description}
                  </p>
                  <Badge
                    variant="outline"
                    className={`mt-3 ${RARITY_STYLES[celebrateBadge.badge.rarity].text}`}
                  >
                    {RARITY_LABELS[celebrateBadge.badge.rarity]}
                  </Badge>
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button
                  className="w-full bg-gradient-hero hover:opacity-90"
                  onClick={() => setCelebrateBadge(null)}
                >
                  Awesome!
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GoalsAndAchievements;
