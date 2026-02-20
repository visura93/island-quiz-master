import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ArrowLeft,
  Trophy,
  Medal,
  Crown,
  Flame,
  TrendingUp,
  BookOpen,
  Calendar,
  Target,
  Award,
  Users,
  ChevronUp,
  Star,
  Sparkles,
  GraduationCap,
  Atom,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { apiService, Subject, SystemSettings } from "@/lib/api";
import type {
  LeaderboardEntry,
  LeaderboardResponse,
  LeaderboardFilters,
  StreakInfo,
  StreakLeaderboardEntry,
} from "@/lib/api";
import {
  getMockLeaderboard,
  getMockSubjectLeaderboard,
  getMockStreakInfo,
  getMockStreakLeaderboard,
  MOCK_SUBJECTS,
} from "@/lib/mockLeaderboardData";

// ─── Podium ────────────────────────────────────────────────────────────────────

const PODIUM_META = [
  { place: 2, order: "order-1 lg:order-1", height: "h-28 lg:h-32", color: "slate", icon: Medal, label: "2nd" },
  { place: 1, order: "order-0 lg:order-2", height: "h-36 lg:h-44", color: "amber", icon: Crown, label: "1st" },
  { place: 3, order: "order-2 lg:order-3", height: "h-24 lg:h-28", color: "orange", icon: Award, label: "3rd" },
] as const;

function podiumColors(place: 1 | 2 | 3, isDark: boolean) {
  const map = {
    1: {
      border: isDark ? "border-amber-400/60" : "border-amber-400",
      bg: isDark ? "bg-amber-500/10" : "bg-amber-50",
      text: isDark ? "text-amber-400" : "text-amber-600",
      glow: isDark ? "shadow-amber-500/20" : "",
      avatar: isDark ? "bg-gradient-to-br from-amber-400 to-yellow-500" : "bg-gradient-to-br from-amber-400 to-yellow-500",
      bar: isDark ? "bg-gradient-to-t from-amber-500/30 to-amber-400/10" : "bg-gradient-to-t from-amber-200 to-amber-50",
    },
    2: {
      border: isDark ? "border-slate-400/50" : "border-slate-300",
      bg: isDark ? "bg-slate-500/10" : "bg-slate-50",
      text: isDark ? "text-slate-300" : "text-slate-500",
      glow: isDark ? "shadow-slate-400/10" : "",
      avatar: isDark ? "bg-gradient-to-br from-slate-300 to-slate-500" : "bg-gradient-to-br from-slate-300 to-slate-400",
      bar: isDark ? "bg-gradient-to-t from-slate-500/20 to-slate-400/5" : "bg-gradient-to-t from-slate-200 to-slate-50",
    },
    3: {
      border: isDark ? "border-orange-500/50" : "border-orange-300",
      bg: isDark ? "bg-orange-500/10" : "bg-orange-50",
      text: isDark ? "text-orange-400" : "text-orange-600",
      glow: isDark ? "shadow-orange-500/10" : "",
      avatar: isDark ? "bg-gradient-to-br from-orange-400 to-amber-600" : "bg-gradient-to-br from-orange-400 to-amber-500",
      bar: isDark ? "bg-gradient-to-t from-orange-500/20 to-orange-400/5" : "bg-gradient-to-t from-orange-200 to-orange-50",
    },
  };
  return map[place];
}

function PodiumCard({ entry, meta, isDark }: { entry: LeaderboardEntry; meta: typeof PODIUM_META[number]; isDark: boolean }) {
  const c = podiumColors(meta.place as 1 | 2 | 3, isDark);
  const Icon = meta.icon;
  return (
    <div className={`flex flex-col items-center ${meta.order} transition-all`}>
      <div
        className={`relative flex flex-col items-center rounded-2xl border-2 p-4 lg:p-5 shadow-xl backdrop-blur-sm transition-all hover:scale-105 w-full max-w-[180px] ${c.border} ${c.bg} ${c.glow}`}
      >
        <Icon className={`h-5 w-5 mb-2 ${c.text}`} />
        <div className={`w-14 h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ${c.avatar}`}>
          {entry.studentName.charAt(0)}
        </div>
        <p className={`mt-3 font-semibold text-sm text-center line-clamp-1 ${isDark ? "text-white" : "text-foreground"}`}>
          {entry.studentName}
        </p>
        <p className={`text-2xl font-bold mt-1 ${c.text}`}>{entry.score}%</p>
        <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-muted-foreground"}`}>
          {entry.quizzesCompleted} quizzes
        </p>
      </div>
      <div className={`w-20 lg:w-24 ${meta.height} rounded-t-lg mt-2 flex items-end justify-center pb-2 ${c.bar}`}>
        <span className={`text-lg font-extrabold ${c.text}`}>#{meta.place}</span>
      </div>
    </div>
  );
}

function Podium({ entries, isDark }: { entries: LeaderboardEntry[]; isDark: boolean }) {
  if (entries.length === 0) return null;
  const available = PODIUM_META.filter((meta) => meta.place <= entries.length);
  return (
    <div className="flex items-end justify-center gap-3 lg:gap-6 mb-8">
      {available.map((meta) => {
        const entry = entries[meta.place - 1];
        return <PodiumCard key={meta.place} entry={entry} meta={meta} isDark={isDark} />;
      })}
    </div>
  );
}

// ─── Leaderboard Table ─────────────────────────────────────────────────────────

function LeaderboardTable({
  entries,
  isDark,
  startFrom = 4,
  showStreak = true,
}: {
  entries: LeaderboardEntry[];
  isDark: boolean;
  startFrom?: number;
  showStreak?: boolean;
}) {
  const rows = entries.slice(startFrom - 1);
  if (rows.length === 0) return null;

  return (
    <div className={`rounded-xl border-2 overflow-hidden ${isDark ? "border-slate-700/60 bg-slate-800/40" : "border-border bg-background"}`}>
      <div className={`grid ${showStreak ? "grid-cols-[3rem_1fr_5rem_5rem_5rem]" : "grid-cols-[3rem_1fr_5rem_5rem]"} gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-400 bg-slate-800/60" : "text-muted-foreground bg-muted/50"}`}>
        <span>#</span>
        <span>Student</span>
        <span className="text-center">Score</span>
        <span className="text-center">Quizzes</span>
        {showStreak && <span className="text-center">Streak</span>}
      </div>
      <div className="divide-y divide-border/40">
        {rows.map((entry) => (
          <div
            key={entry.studentId}
            className={`grid ${showStreak ? "grid-cols-[3rem_1fr_5rem_5rem_5rem]" : "grid-cols-[3rem_1fr_5rem_5rem]"} gap-2 px-4 py-3 items-center transition-colors ${
              entry.isCurrentUser
                ? isDark
                  ? "bg-primary/15 border-l-4 border-l-primary"
                  : "bg-primary/10 border-l-4 border-l-primary"
                : isDark
                ? "hover:bg-slate-700/30"
                : "hover:bg-muted/30"
            }`}
          >
            <span className={`font-bold text-sm ${isDark ? "text-slate-300" : "text-foreground"}`}>{entry.rank}</span>
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${isDark ? "bg-slate-600" : "bg-slate-400"}`}>
                {entry.studentName.charAt(0)}
              </div>
              <span className={`text-sm font-medium truncate ${entry.isCurrentUser ? "font-bold" : ""} ${isDark ? "text-white" : "text-foreground"}`}>
                {entry.studentName}
                {entry.isCurrentUser && (
                  <Badge className="ml-2 text-[10px] px-1.5 py-0" variant="default">You</Badge>
                )}
              </span>
            </div>
            <span className={`text-sm font-semibold text-center ${entry.score >= 80 ? (isDark ? "text-green-400" : "text-green-600") : entry.score >= 60 ? (isDark ? "text-amber-400" : "text-amber-600") : (isDark ? "text-red-400" : "text-red-600")}`}>
              {entry.score}%
            </span>
            <span className={`text-sm text-center ${isDark ? "text-slate-300" : "text-muted-foreground"}`}>{entry.quizzesCompleted}</span>
            {showStreak && (
              <div className="flex items-center justify-center gap-1">
                {entry.currentStreak > 0 && <Flame className={`h-3.5 w-3.5 ${isDark ? "text-orange-400" : "text-orange-500"}`} />}
                <span className={`text-sm ${isDark ? "text-slate-300" : "text-muted-foreground"}`}>{entry.currentStreak}d</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Streak Table ──────────────────────────────────────────────────────────────

function StreakTable({ entries, isDark }: { entries: StreakLeaderboardEntry[]; isDark: boolean }) {
  if (entries.length === 0) return null;
  return (
    <div className={`rounded-xl border-2 overflow-hidden ${isDark ? "border-slate-700/60 bg-slate-800/40" : "border-border bg-background"}`}>
      <div className="grid grid-cols-[3rem_1fr_6rem_6rem] gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider"
        style={{ color: isDark ? "rgb(148 163 184)" : undefined }}
      >
        <span>#</span>
        <span>Student</span>
        <span className="text-center">Current</span>
        <span className="text-center">Best</span>
      </div>
      <div className="divide-y divide-border/40">
        {entries.map((entry) => (
          <div
            key={entry.studentId}
            className={`grid grid-cols-[3rem_1fr_6rem_6rem] gap-2 px-4 py-3 items-center transition-colors ${
              entry.isCurrentUser
                ? isDark ? "bg-primary/15 border-l-4 border-l-primary" : "bg-primary/10 border-l-4 border-l-primary"
                : isDark ? "hover:bg-slate-700/30" : "hover:bg-muted/30"
            }`}
          >
            <span className={`font-bold text-sm ${isDark ? "text-slate-300" : "text-foreground"}`}>{entry.rank}</span>
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${isDark ? "bg-slate-600" : "bg-slate-400"}`}>
                {entry.studentName.charAt(0)}
              </div>
              <span className={`text-sm font-medium truncate ${entry.isCurrentUser ? "font-bold" : ""} ${isDark ? "text-white" : "text-foreground"}`}>
                {entry.studentName}
                {entry.isCurrentUser && <Badge className="ml-2 text-[10px] px-1.5 py-0" variant="default">You</Badge>}
              </span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <Flame className={`h-4 w-4 ${entry.currentStreak > 0 ? (isDark ? "text-orange-400" : "text-orange-500") : "text-muted-foreground"}`} />
              <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-foreground"}`}>{entry.currentStreak}d</span>
            </div>
            <span className={`text-sm text-center ${isDark ? "text-slate-400" : "text-muted-foreground"}`}>{entry.longestStreak}d</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Calendar Heatmap ──────────────────────────────────────────────────────────

function CalendarHeatmap({ calendar, isDark }: { calendar: { date: string; active: boolean }[]; isDark: boolean }) {
  const weeks: { date: string; active: boolean }[][] = [];
  let current: { date: string; active: boolean }[] = [];

  const firstDay = new Date(calendar[0]?.date ?? new Date());
  const pad = firstDay.getDay();
  for (let i = 0; i < pad; i++) current.push({ date: '', active: false });

  for (const day of calendar) {
    current.push(day);
    if (current.length === 7) {
      weeks.push(current);
      current = [];
    }
  }
  if (current.length > 0) {
    while (current.length < 7) current.push({ date: '', active: false });
    weeks.push(current);
  }

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex gap-[3px]">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) => {
              if (!day.date) return <div key={di} className="w-3 h-3 lg:w-3.5 lg:h-3.5" />;
              return (
                <Tooltip key={di}>
                  <TooltipTrigger asChild>
                    <div
                      className={`w-3 h-3 lg:w-3.5 lg:h-3.5 rounded-sm transition-colors ${
                        day.active
                          ? isDark
                            ? "bg-green-500"
                            : "bg-green-500"
                          : isDark
                          ? "bg-slate-700"
                          : "bg-slate-200"
                      }`}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {day.date} — {day.active ? "Active" : "Inactive"}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}

// ─── Skeleton Loaders ──────────────────────────────────────────────────────────

function PodiumSkeleton() {
  return (
    <div className="flex items-end justify-center gap-6 mb-8">
      {[120, 160, 100].map((h, i) => (
        <div key={i} className="flex flex-col items-center">
          <Skeleton className={`w-36 rounded-2xl`} style={{ height: h }} />
          <Skeleton className="w-20 h-24 mt-2 rounded-t-lg" />
        </div>
      ))}
    </div>
  );
}

function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ isDark }: { isDark: boolean }) {
  return (
    <div className="text-center py-16">
      <Trophy className={`h-16 w-16 mx-auto mb-4 ${isDark ? "text-slate-600" : "text-muted-foreground/40"}`} />
      <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-slate-300" : "text-foreground"}`}>
        No rankings yet
      </h3>
      <p className={`text-sm max-w-sm mx-auto ${isDark ? "text-slate-500" : "text-muted-foreground"}`}>
        Complete some quizzes to appear on the leaderboard!
      </p>
    </div>
  );
}

// ─── Your Position Floating Card ───────────────────────────────────────────────

function YourPositionCard({ entry, isDark }: { entry?: LeaderboardEntry; isDark: boolean }) {
  if (!entry) return null;
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 px-6 py-3 rounded-2xl border-2 shadow-2xl backdrop-blur-xl transition-all ${
      isDark
        ? "bg-slate-900/90 border-primary/40 shadow-primary/20"
        : "bg-background/95 border-primary/30 shadow-lg"
    }`}>
      <div className="flex items-center gap-2">
        <ChevronUp className={`h-4 w-4 ${isDark ? "text-primary" : "text-primary"}`} />
        <span className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-muted-foreground"}`}>Your Rank</span>
        <span className={`text-lg font-bold ${isDark ? "text-white" : "text-foreground"}`}>#{entry.rank}</span>
      </div>
      <div className={`w-px h-6 ${isDark ? "bg-slate-700" : "bg-border"}`} />
      <span className={`text-sm font-semibold ${entry.score >= 80 ? (isDark ? "text-green-400" : "text-green-600") : (isDark ? "text-amber-400" : "text-amber-600")}`}>
        {entry.score}%
      </span>
      <div className={`w-px h-6 ${isDark ? "bg-slate-700" : "bg-border"}`} />
      <div className="flex items-center gap-1">
        <Flame className={`h-4 w-4 ${isDark ? "text-orange-400" : "text-orange-500"}`} />
        <span className={`text-sm font-semibold ${isDark ? "text-white" : "text-foreground"}`}>{entry.currentStreak}d</span>
      </div>
    </div>
  );
}

// ─── Main Leaderboard Page ─────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "al", label: "A/L", icon: Atom, grade: "grade-12", settingsKey: "enableAL" as const, subjectCategory: "Grade 12-13", color: "blue" },
  { id: "ol", label: "O/L", icon: GraduationCap, grade: "grade-11", settingsKey: "enableOL" as const, subjectCategory: "Grade 10-11", color: "green" },
  { id: "scholarship", label: "Scholarship", icon: Sparkles, grade: "grade-5", settingsKey: "enableScholarship" as const, subjectCategory: "Scholarship", color: "amber" },
] as const;

const Leaderboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [activeTab, setActiveTab] = useState("by-subject");
  const [selectedCategory, setSelectedCategory] = useState("al");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [period, setPeriod] = useState<"week" | "month" | "allTime">("allTime");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardResponse | null>(null);
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);
  const [streakLeaderboard, setStreakLeaderboard] = useState<StreakLeaderboardEntry[]>([]);

  const currentUserId = user?.id ?? "";
  const currentUserName = user?.fullName ?? user?.firstName ?? "You";

  const activeCat = CATEGORIES.find(c => c.id === selectedCategory) ?? CATEGORIES[0];

  useEffect(() => {
    const load = async () => {
      try {
        const [subjectData, settings] = await Promise.all([
          apiService.getAllSubjects(),
          apiService.getSystemSettings(),
        ]);
        setSubjects(subjectData);
        setSystemSettings(settings);

        // Default to the first enabled category
        const firstEnabled = CATEGORIES.find(c => settings[c.settingsKey]);
        if (firstEnabled) setSelectedCategory(firstEnabled.id);
      } catch {
        setSelectedSubject(MOCK_SUBJECTS[0]);
      }
    };
    load();
  }, []);

  // Filter subjects for the selected category and auto-select the first one
  const categorySubjects = useMemo(() => {
    if (subjects.length === 0) return MOCK_SUBJECTS.map(s => ({ value: s, label: s }));
    return subjects
      .filter(s => s.isActive && s.category === activeCat.subjectCategory)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(s => ({ value: s.value, label: s.name }));
  }, [subjects, activeCat]);

  // When category or subjects list changes, reset selected subject to the first one in that category
  useEffect(() => {
    if (categorySubjects.length > 0) {
      setSelectedSubject(categorySubjects[0].value);
    } else {
      setSelectedSubject("");
    }
  }, [selectedCategory, categorySubjects.length]);

  useEffect(() => {
    if (selectedSubject || activeTab !== "by-subject") {
      loadLeaderboard();
    }
  }, [activeTab, selectedSubject, selectedCategory, period, currentUserId]);

  const loadLeaderboard = async () => {
    setLoading(true);
    const filters: LeaderboardFilters = { period, limit: 50, category: selectedCategory, grade: activeCat.grade };

    try {
      if (activeTab === "by-subject") {
        const sub = selectedSubject || (categorySubjects.length > 0 ? categorySubjects[0].value : MOCK_SUBJECTS[0]);
        try {
          const data = await apiService.getSubjectLeaderboard(sub, filters);
          setLeaderboardData(data);
        } catch {
          setLeaderboardData(getMockSubjectLeaderboard(sub, filters, currentUserId, currentUserName));
        }
      } else if (activeTab === "overall") {
        try {
          const data = await apiService.getLeaderboard(filters);
          setLeaderboardData(data);
        } catch {
          setLeaderboardData(getMockLeaderboard(filters, currentUserId, currentUserName));
        }
      } else if (activeTab === "weekly-monthly") {
        const p = period === "allTime" ? "month" : period;
        try {
          const data = await apiService.getLeaderboard({ ...filters, period: p });
          setLeaderboardData(data);
        } catch {
          setLeaderboardData(getMockLeaderboard({ ...filters, period: p }, currentUserId, currentUserName));
        }
      } else if (activeTab === "streaks") {
        try {
          const [info, lb] = await Promise.all([
            apiService.getStreakInfo(),
            apiService.getStreakLeaderboard(30),
          ]);
          setStreakInfo(info);
          setStreakLeaderboard(lb);
        } catch {
          setStreakInfo(getMockStreakInfo());
          setStreakLeaderboard(getMockStreakLeaderboard(currentUserId, currentUserName));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const entries = leaderboardData?.entries ?? [];
  const myEntry = leaderboardData?.myEntry;

  return (
    <div className={`min-h-screen relative overflow-hidden ${isDark ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" : "bg-gradient-mesh"}`}>
      {isDark && (
        <>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000" />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
        </>
      )}

      {/* Header */}
      <div className={`sticky top-0 z-50 backdrop-blur-xl border-b shadow-lg ${isDark ? "bg-slate-900/80 border-cyan-500/20 shadow-cyan-500/10" : "bg-background/80 border-border/50"}`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate("/student-dashboard")}
                className={isDark ? "bg-slate-800/50 border-cyan-500/30 text-cyan-100 hover:bg-slate-700/50 hover:border-cyan-500/50" : ""}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className={`text-3xl font-bold bg-clip-text text-transparent ${isDark ? "bg-gradient-to-r from-amber-400 via-orange-400 to-red-400" : "bg-gradient-hero"}`}>
                  Leaderboard
                </h1>
                <p className={isDark ? "text-slate-400" : "text-muted-foreground"}>
                  {leaderboardData
                    ? `${leaderboardData.totalParticipants} ${activeCat.label} students competing`
                    : "See where you stand"}
                </p>
              </div>
            </div>
            <DarkModeToggle />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10 pb-24">
        {/* Category Selector */}
        <div className="mb-6">
          <p className={`text-sm font-medium mb-3 ${isDark ? "text-slate-400" : "text-muted-foreground"}`}>
            Select Category
          </p>
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((cat) => {
              const enabled = systemSettings ? systemSettings[cat.settingsKey] : true;
              const isActive = selectedCategory === cat.id;
              const CatIcon = cat.icon;

              const colorMap = {
                blue: {
                  active: isDark
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-400 shadow-lg shadow-blue-500/30"
                    : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-400 shadow-lg",
                  inactive: isDark
                    ? "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50 hover:border-blue-500/50"
                    : "hover:border-blue-300 hover:bg-blue-50",
                },
                green: {
                  active: isDark
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-400 shadow-lg shadow-green-500/30"
                    : "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-400 shadow-lg",
                  inactive: isDark
                    ? "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50 hover:border-green-500/50"
                    : "hover:border-green-300 hover:bg-green-50",
                },
                amber: {
                  active: isDark
                    ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-amber-400 shadow-lg shadow-amber-500/30"
                    : "bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-amber-400 shadow-lg",
                  inactive: isDark
                    ? "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50 hover:border-amber-500/50"
                    : "hover:border-amber-300 hover:bg-amber-50",
                },
              };
              const colors = colorMap[cat.color];

              return (
                <Button
                  key={cat.id}
                  variant="outline"
                  disabled={!enabled}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`gap-2 px-5 py-2.5 transition-all ${
                    !enabled
                      ? "opacity-40 cursor-not-allowed"
                      : isActive
                      ? colors.active
                      : colors.inactive
                  }`}
                >
                  <CatIcon className="h-4 w-4" />
                  {cat.label}
                  {!enabled && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 ml-1 border-current opacity-70">
                      Soon
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full grid-cols-2 lg:grid-cols-4 mb-8 h-auto ${isDark ? "bg-slate-800/60 border border-slate-700/60" : ""}`}>
            <TabsTrigger value="by-subject" className={`gap-2 py-2.5 ${isDark ? "data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white" : ""}`}>
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">By Subject</span>
              <span className="sm:hidden">Subject</span>
            </TabsTrigger>
            <TabsTrigger value="overall" className={`gap-2 py-2.5 ${isDark ? "data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white" : ""}`}>
              <Trophy className="h-4 w-4" />
              Overall
            </TabsTrigger>
            <TabsTrigger value="weekly-monthly" className={`gap-2 py-2.5 ${isDark ? "data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white" : ""}`}>
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Weekly / Monthly</span>
              <span className="sm:hidden">Time</span>
            </TabsTrigger>
            <TabsTrigger value="streaks" className={`gap-2 py-2.5 ${isDark ? "data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white" : ""}`}>
              <Flame className="h-4 w-4" />
              Streaks
            </TabsTrigger>
          </TabsList>

          {/* ── By Subject ──────────────────────────────────────────────── */}
          <TabsContent value="by-subject">
            <div className="flex flex-wrap gap-3 mb-6">
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className={`w-[220px] ${isDark ? "bg-slate-800/60 border-slate-700 text-white" : ""}`}>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {categorySubjects.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {loading ? (
              <>
                <PodiumSkeleton />
                <TableSkeleton />
              </>
            ) : entries.length === 0 ? (
              <EmptyState isDark={isDark} />
            ) : (
              <>
                <Podium entries={entries} isDark={isDark} />
                <LeaderboardTable entries={entries} isDark={isDark} startFrom={Math.min(entries.length, 3) + 1} />
              </>
            )}
          </TabsContent>

          {/* ── Overall ─────────────────────────────────────────────────── */}
          <TabsContent value="overall">
            {loading ? (
              <>
                <PodiumSkeleton />
                <TableSkeleton />
              </>
            ) : entries.length === 0 ? (
              <EmptyState isDark={isDark} />
            ) : (
              <>
                <Podium entries={entries} isDark={isDark} />
                <LeaderboardTable entries={entries} isDark={isDark} startFrom={Math.min(entries.length, 3) + 1} />
              </>
            )}
          </TabsContent>

          {/* ── Weekly / Monthly ─────────────────────────────────────────── */}
          <TabsContent value="weekly-monthly">
            <div className="flex gap-3 mb-6">
              <Button
                variant={period === "week" ? "default" : "outline"}
                onClick={() => setPeriod("week")}
                className={`transition-all ${
                  period === "week"
                    ? isDark ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-400 shadow-lg shadow-purple-500/30" : ""
                    : isDark ? "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50" : ""
                }`}
              >
                <Calendar className="h-4 w-4 mr-2" />
                This Week
              </Button>
              <Button
                variant={period === "month" ? "default" : "outline"}
                onClick={() => setPeriod("month")}
                className={`transition-all ${
                  period === "month"
                    ? isDark ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-400 shadow-lg shadow-purple-500/30" : ""
                    : isDark ? "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50" : ""
                }`}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                This Month
              </Button>
            </div>
            {loading ? (
              <>
                <PodiumSkeleton />
                <TableSkeleton />
              </>
            ) : entries.length === 0 ? (
              <EmptyState isDark={isDark} />
            ) : (
              <>
                <Podium entries={entries} isDark={isDark} />
                <LeaderboardTable entries={entries} isDark={isDark} startFrom={Math.min(entries.length, 3) + 1} />
              </>
            )}
          </TabsContent>

          {/* ── Streaks ─────────────────────────────────────────────────── */}
          <TabsContent value="streaks">
            {loading ? (
              <div className="space-y-6">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
                <TableSkeleton rows={6} />
              </div>
            ) : (
              <div className="space-y-8">
                {/* Your Streak Card */}
                {streakInfo && (
                  <Card className={`border-2 overflow-hidden ${isDark ? "bg-slate-800/50 border-orange-500/30" : "bg-gradient-card border-orange-200"}`}>
                    <CardContent className="p-6 lg:p-8">
                      <div className="flex flex-col lg:flex-row items-center gap-8">
                        <div className="flex flex-col items-center text-center">
                          <div className={`relative p-5 rounded-2xl mb-3 ${isDark ? "bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30" : "bg-orange-50 border-2 border-orange-200"}`}>
                            <Flame className={`h-12 w-12 ${isDark ? "text-orange-400" : "text-orange-500"} animate-pulse`} />
                            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                              {streakInfo.currentStreak}d
                            </div>
                          </div>
                          <p className={`text-4xl font-extrabold ${isDark ? "bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent" : "text-orange-600"}`}>
                            {streakInfo.currentStreak} days
                          </p>
                          <p className={`text-sm ${isDark ? "text-slate-400" : "text-muted-foreground"}`}>Current Streak</p>
                          <p className={`text-xs mt-1 ${isDark ? "text-slate-500" : "text-muted-foreground"}`}>
                            Best: {streakInfo.longestStreak} days
                          </p>
                        </div>

                        <div className="flex-1 space-y-4 w-full">
                          <div>
                            <p className={`text-sm font-semibold mb-3 ${isDark ? "text-slate-300" : "text-foreground"}`}>
                              Last 90 Days
                            </p>
                            <div className="overflow-x-auto pb-2">
                              <CalendarHeatmap calendar={streakInfo.streakCalendar} isDark={isDark} />
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`text-xs ${isDark ? "text-slate-500" : "text-muted-foreground"}`}>Less</span>
                              <div className={`w-3 h-3 rounded-sm ${isDark ? "bg-slate-700" : "bg-slate-200"}`} />
                              <div className="w-3 h-3 rounded-sm bg-green-300" />
                              <div className="w-3 h-3 rounded-sm bg-green-500" />
                              <span className={`text-xs ${isDark ? "text-slate-500" : "text-muted-foreground"}`}>More</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Streak Milestones */}
                {streakInfo && (
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-foreground"}`}>
                      <Target className={`h-5 w-5 ${isDark ? "text-amber-400" : "text-amber-600"}`} />
                      Milestones
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {streakInfo.milestones.map((m) => (
                        <div
                          key={m.days}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all ${
                            m.achieved
                              ? isDark
                                ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                                : "bg-amber-50 border-amber-300 text-amber-700"
                              : isDark
                              ? "bg-slate-800/40 border-slate-700 text-slate-500"
                              : "bg-muted/50 border-border text-muted-foreground"
                          }`}
                        >
                          <Star className={`h-4 w-4 ${m.achieved ? "fill-current" : ""}`} />
                          <span className="font-semibold text-sm">{m.days} days</span>
                          {m.achieved && <Badge className="text-[10px] px-1.5 py-0 bg-amber-500 text-white border-0">Done</Badge>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Streak Leaderboard Table */}
                <div>
                  <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? "text-white" : "text-foreground"}`}>
                    <Users className={`h-5 w-5 ${isDark ? "text-orange-400" : "text-orange-600"}`} />
                    Streak Rankings
                  </h3>
                  <StreakTable entries={streakLeaderboard} isDark={isDark} />
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating "Your Position" card (non-streak tabs) */}
      {activeTab !== "streaks" && !loading && myEntry && <YourPositionCard entry={myEntry} isDark={isDark} />}
    </div>
  );
};

export default Leaderboard;
