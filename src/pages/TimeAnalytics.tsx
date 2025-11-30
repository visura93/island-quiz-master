import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Clock, 
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Target,
  Zap,
  BookOpen,
  Award,
  School
} from "lucide-react";
import { 
  PieChart, 
  Pie,
  Cell, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { apiService, TimeAnalytics as TimeAnalyticsType } from "@/lib/api";
import { DarkModeToggle } from "@/components/DarkModeToggle";

const TimeAnalytics = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [timeRange, setTimeRange] = useState<"daily" | "weekly" | "monthly">("daily");
  const [timeAnalyticsData, setTimeAnalyticsData] = useState<TimeAnalyticsType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Fetch time analytics data on component mount
  useEffect(() => {
    const fetchTimeAnalytics = async () => {
      try {
        setIsLoading(true);
        const analytics = await apiService.getTimeAnalytics();
        console.log("Time Analytics Data:", analytics); // Debug log
        setTimeAnalyticsData(analytics);
      } catch (err: any) {
        console.error("Error fetching time analytics:", err); // Debug log
        setError(err.message || "Failed to load time analytics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeAnalytics();
  }, []);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getCurrentData = () => {
    if (!timeAnalyticsData) return [];
    switch (timeRange) {
      case "daily":
        return timeAnalyticsData.daily;
      case "weekly":
        return timeAnalyticsData.weekly;
      case "monthly":
        return timeAnalyticsData.monthly;
      default:
        return timeAnalyticsData.daily;
    }
  };

  const getTotalTimeForRange = () => {
    return getCurrentData().reduce((sum, item) => sum + item.time, 0);
  };

  const getAverageTimePerSession = () => {
    const data = getCurrentData();
    if (data.length === 0) return 0;
    return Math.round(data.reduce((sum, item) => sum + item.time, 0) / data.length);
  };

  const getMostProductiveDay = () => {
    const data = getCurrentData();
    if (data.length === 0) return null;
    const maxTime = Math.max(...data.map(item => item.time));
    const mostProductive = data.find(item => item.time === maxTime);
    if (!mostProductive) return null;
    
    // Return the appropriate label based on time range
    if (timeRange === "daily" && 'day' in mostProductive) {
      return mostProductive.day;
    } else if (timeRange === "weekly" && 'week' in mostProductive) {
      return mostProductive.week;
    } else if (timeRange === "monthly" && 'month' in mostProductive) {
      return mostProductive.month;
    }
    return null;
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${
      isDark 
        ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" 
        : "bg-gradient-mesh"
    }`}>
      {/* Animated Background Effects - Only in dark mode */}
      {isDark && (
        <>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
          </div>
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>
        </>
      )}

      {/* Header */}
      <div className={`sticky top-0 z-50 backdrop-blur-xl border-b shadow-lg ${
        isDark 
          ? "bg-slate-900/80 border-cyan-500/20 shadow-cyan-500/10" 
          : "bg-background/80 border-border/50"
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/student-dashboard')}
                className={isDark ? "btn-modern bg-slate-800/50 border-cyan-500/30 text-cyan-100 hover:bg-slate-700/50 hover:border-cyan-500/50" : "btn-modern"}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className={`text-3xl font-bold bg-clip-text text-transparent ${
                  isDark 
                    ? "bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400" 
                    : "bg-gradient-hero"
                }`}>
                  Time Analytics
                </h1>
                <p className={isDark ? "text-slate-400" : "text-muted-foreground"}>Track your learning progress and time investment</p>
              </div>
            </div>
            <DarkModeToggle />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="relative">
              <div className={`animate-spin rounded-full h-16 w-16 border-4 mx-auto mb-4 ${
                isDark ? "border-cyan-500/30 border-t-cyan-400" : "border-primary/30 border-t-primary"
              }`}></div>
              <div className={`absolute inset-0 rounded-full border-4 border-transparent animate-spin mx-auto ${
                isDark ? "border-t-cyan-400" : "border-t-primary"
              }`} style={{ animationDuration: '0.75s' }}></div>
            </div>
            <p className={isDark ? "text-slate-400 mt-4" : "text-muted-foreground mt-4"}>Loading time analytics...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className={isDark ? "text-red-400 mb-4" : "text-red-600 mb-4"}>
              <Clock className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-semibold">Error loading data</p>
              <p className={isDark ? "text-sm text-slate-400" : "text-sm text-muted-foreground"}>{error}</p>
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className={isDark ? "bg-slate-800/50 border-red-500/30 text-red-100 hover:bg-slate-700/50" : ""}
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && timeAnalyticsData && (
          <>
            {/* Time Range Selector */}
            <div className="flex flex-wrap gap-3 mb-8">
          <Button
            variant={timeRange === "daily" ? "default" : "outline"}
            onClick={() => setTimeRange("daily")}
            className={`btn-modern transition-all ${
              timeRange === "daily" 
                ? (isDark ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-cyan-400 shadow-lg shadow-cyan-500/50" : "bg-primary text-primary-foreground")
                : (isDark ? "bg-slate-800/50 border-cyan-500/30 text-cyan-100 hover:bg-slate-700/50 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20" : "")
            }`}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Daily
          </Button>
          <Button
            variant={timeRange === "weekly" ? "default" : "outline"}
            onClick={() => setTimeRange("weekly")}
            className={`btn-modern transition-all ${
              timeRange === "weekly" 
                ? (isDark ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-blue-400 shadow-lg shadow-blue-500/50" : "bg-primary text-primary-foreground")
                : (isDark ? "bg-slate-800/50 border-blue-500/30 text-blue-100 hover:bg-slate-700/50 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20" : "")
            }`}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Weekly
          </Button>
          <Button
            variant={timeRange === "monthly" ? "default" : "outline"}
            onClick={() => setTimeRange("monthly")}
            className={`btn-modern transition-all ${
              timeRange === "monthly" 
                ? (isDark ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-400 shadow-lg shadow-purple-500/50" : "bg-primary text-primary-foreground")
                : (isDark ? "bg-slate-800/50 border-purple-500/30 text-purple-100 hover:bg-slate-700/50 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20" : "")
            }`}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Monthly
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className={`border-2 backdrop-blur-xl shadow-xl transition-all hover:scale-105 ${
            isDark 
              ? "border-cyan-500/30 bg-slate-800/50 shadow-cyan-500/10 hover:shadow-cyan-500/20 hover:border-cyan-500/50" 
              : "border-2 shadow-elegant bg-gradient-card"
          }`}>
            <CardContent className="p-6 text-center relative overflow-hidden">
              {isDark && <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl -translate-y-16 translate-x-16"></div>}
              <div className="relative z-10">
                <div className={`p-3 rounded-xl w-fit mx-auto mb-3 ${
                  isDark 
                    ? "bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30" 
                    : "bg-primary/10"
                }`}>
                  <Clock className={`h-6 w-6 ${isDark ? "text-cyan-400" : "text-primary"}`} />
                </div>
                <div className={`text-3xl font-bold mb-1 ${
                  isDark 
                    ? "bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent" 
                    : "text-primary"
                }`}>
                  {formatTime(getTotalTimeForRange())}
                </div>
                <p className={isDark ? "text-sm text-slate-400" : "text-sm text-muted-foreground"}>Total Time</p>
              </div>
            </CardContent>
          </Card>

          <Card className={`border-2 backdrop-blur-xl shadow-xl transition-all hover:scale-105 ${
            isDark 
              ? "border-green-500/30 bg-slate-800/50 shadow-green-500/10 hover:shadow-green-500/20 hover:border-green-500/50" 
              : "border-2 shadow-elegant bg-gradient-card"
          }`}>
            <CardContent className="p-6 text-center relative overflow-hidden">
              {isDark && <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -translate-y-16 translate-x-16"></div>}
              <div className="relative z-10">
                <div className={`p-3 rounded-xl w-fit mx-auto mb-3 ${
                  isDark 
                    ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30" 
                    : "bg-green-100"
                }`}>
                  <Activity className={`h-6 w-6 ${isDark ? "text-green-400" : "text-green-600"}`} />
                </div>
                <div className={`text-3xl font-bold mb-1 ${
                  isDark 
                    ? "bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent" 
                    : "text-green-600"
                }`}>
                  {formatTime(getAverageTimePerSession())}
                </div>
                <p className={isDark ? "text-sm text-slate-400" : "text-sm text-muted-foreground"}>Avg per Session</p>
              </div>
            </CardContent>
          </Card>

          <Card className={`border-2 backdrop-blur-xl shadow-xl transition-all hover:scale-105 ${
            isDark 
              ? "border-blue-500/30 bg-slate-800/50 shadow-blue-500/10 hover:shadow-blue-500/20 hover:border-blue-500/50" 
              : "border-2 shadow-elegant bg-gradient-card"
          }`}>
            <CardContent className="p-6 text-center relative overflow-hidden">
              {isDark && <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -translate-y-16 translate-x-16"></div>}
              <div className="relative z-10">
                <div className={`p-3 rounded-xl w-fit mx-auto mb-3 ${
                  isDark 
                    ? "bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30" 
                    : "bg-blue-100"
                }`}>
                  <Target className={`h-6 w-6 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                </div>
                <div className={`text-3xl font-bold mb-1 ${
                  isDark 
                    ? "bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent" 
                    : "text-blue-600"
                }`}>
                  {getCurrentData().length}
                </div>
                <p className={isDark ? "text-sm text-slate-400" : "text-sm text-muted-foreground"}>Sessions</p>
              </div>
            </CardContent>
          </Card>

          <Card className={`border-2 backdrop-blur-xl shadow-xl transition-all hover:scale-105 ${
            isDark 
              ? "border-purple-500/30 bg-slate-800/50 shadow-purple-500/10 hover:shadow-purple-500/20 hover:border-purple-500/50" 
              : "border-2 shadow-elegant bg-gradient-card"
          }`}>
            <CardContent className="p-6 text-center relative overflow-hidden">
              {isDark && <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -translate-y-16 translate-x-16"></div>}
              <div className="relative z-10">
                <div className={`p-3 rounded-xl w-fit mx-auto mb-3 ${
                  isDark 
                    ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30" 
                    : "bg-purple-100"
                }`}>
                  <Zap className={`h-6 w-6 ${isDark ? "text-purple-400" : "text-purple-600"}`} />
                </div>
                <div className={`text-3xl font-bold mb-1 ${
                  isDark 
                    ? "bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent" 
                    : "text-purple-600"
                }`}>
                  {getMostProductiveDay() || "N/A"}
                </div>
                <p className={isDark ? "text-sm text-slate-400" : "text-sm text-muted-foreground"}>Most Productive</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Time Distribution by Subject */}
          <Card className={`border-2 backdrop-blur-xl shadow-xl transition-all ${
            isDark 
              ? "border-cyan-500/30 bg-slate-800/50 shadow-cyan-500/10 hover:shadow-cyan-500/20" 
              : "border-2 shadow-elegant bg-gradient-card"
          }`}>
            <CardHeader className={isDark ? "border-b border-slate-700/50" : ""}>
              <CardTitle className={`flex items-center gap-2 ${isDark ? "text-cyan-100" : ""}`}>
                <div className={`p-2 rounded-lg ${
                  isDark 
                    ? "bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30" 
                    : "bg-primary/10"
                }`}>
                  <PieChartIcon className={`h-5 w-5 ${isDark ? "text-cyan-400" : "text-primary"}`} />
                </div>
                Time by Subject
              </CardTitle>
              <CardDescription className={isDark ? "text-slate-400" : ""}>Distribution of study time across subjects</CardDescription>
            </CardHeader>
            <CardContent>
              {timeAnalyticsData.subjectBreakdown && timeAnalyticsData.subjectBreakdown.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={timeAnalyticsData.subjectBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        labelLine={false}
                      >
                        {timeAnalyticsData.subjectBreakdown.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color || `hsl(${180 + index * 60}, 70%, 50%)`}
                            stroke="#1e293b"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => formatTime(Number(value))}
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                          border: '1px solid rgba(6, 182, 212, 0.3)',
                          borderRadius: '8px',
                          color: '#e2e8f0'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ color: '#cbd5e1', fontSize: '12px' }}
                        iconType="circle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className={`h-80 flex items-center justify-center ${isDark ? "text-slate-400" : "text-muted-foreground"}`}>
                  <div className="text-center">
                    <PieChartIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>No data available</p>
                  </div>
                </div>
              )}
              <div className="mt-4 space-y-2">
                {timeAnalyticsData.subjectBreakdown && timeAnalyticsData.subjectBreakdown.length > 0 ? (
                  timeAnalyticsData.subjectBreakdown.map((subject) => (
                  <div key={subject.name} className={`flex items-center justify-between p-2 rounded-lg transition-colors border ${
                    isDark 
                      ? "bg-slate-700/30 hover:bg-slate-700/50 border-slate-600/30" 
                      : "bg-muted/50 hover:bg-muted border-border"
                  }`}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full shadow-lg" 
                        style={{ backgroundColor: subject.color || '#3b82f6' }}
                      />
                      <span className={`text-sm font-medium ${isDark ? "text-slate-200" : ""}`}>{subject.name}</span>
                    </div>
                    <div className={`text-sm font-semibold ${isDark ? "text-cyan-300" : "text-primary"}`}>
                      {formatTime(subject.value)} <span className={isDark ? "text-slate-400" : "text-muted-foreground"}>({subject.percentage}%)</span>
                    </div>
                  </div>
                  ))
                ) : (
                  <p className={`text-sm text-center py-4 ${isDark ? "text-slate-400" : "text-muted-foreground"}`}>No subject data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Time Distribution by Type */}
          <Card className={`border-2 backdrop-blur-xl shadow-xl transition-all ${
            isDark 
              ? "border-purple-500/30 bg-slate-800/50 shadow-purple-500/10 hover:shadow-purple-500/20" 
              : "border-2 shadow-elegant bg-gradient-card"
          }`}>
            <CardHeader className={isDark ? "border-b border-slate-700/50" : ""}>
              <CardTitle className={`flex items-center gap-2 ${isDark ? "text-purple-100" : ""}`}>
                <div className={`p-2 rounded-lg ${
                  isDark 
                    ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30" 
                    : "bg-secondary/10"
                }`}>
                  <BookOpen className={`h-5 w-5 ${isDark ? "text-purple-400" : "text-secondary"}`} />
                </div>
                Time by Quiz Type
              </CardTitle>
              <CardDescription className={isDark ? "text-slate-400" : ""}>Distribution of study time across quiz types</CardDescription>
            </CardHeader>
            <CardContent>
              {timeAnalyticsData.typeBreakdown && timeAnalyticsData.typeBreakdown.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={timeAnalyticsData.typeBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        labelLine={false}
                      >
                        {timeAnalyticsData.typeBreakdown.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color || `hsl(${270 + index * 60}, 70%, 50%)`}
                            stroke="#1e293b"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => formatTime(Number(value))}
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                          border: '1px solid rgba(168, 85, 247, 0.3)',
                          borderRadius: '8px',
                          color: '#e2e8f0'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ color: '#cbd5e1', fontSize: '12px' }}
                        iconType="circle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className={`h-80 flex items-center justify-center ${isDark ? "text-slate-400" : "text-muted-foreground"}`}>
                  <div className="text-center">
                    <PieChartIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>No data available</p>
                  </div>
                </div>
              )}
              <div className="mt-4 space-y-2">
                {timeAnalyticsData.typeBreakdown && timeAnalyticsData.typeBreakdown.length > 0 ? (
                  timeAnalyticsData.typeBreakdown.map((type) => (
                  <div key={type.name} className={`flex items-center justify-between p-2 rounded-lg transition-colors border ${
                    isDark 
                      ? "bg-slate-700/30 hover:bg-slate-700/50 border-slate-600/30" 
                      : "bg-muted/50 hover:bg-muted border-border"
                  }`}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full shadow-lg" 
                        style={{ backgroundColor: type.color || '#a855f7' }}
                      />
                      <span className={`text-sm font-medium ${isDark ? "text-slate-200" : ""}`}>{type.name}</span>
                    </div>
                    <div className={`text-sm font-semibold ${isDark ? "text-purple-300" : "text-secondary"}`}>
                      {formatTime(type.value)} <span className={isDark ? "text-slate-400" : "text-muted-foreground"}>({type.percentage}%)</span>
                    </div>
                  </div>
                  ))
                ) : (
                  <p className={`text-sm text-center py-4 ${isDark ? "text-slate-400" : "text-muted-foreground"}`}>No type data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Time Trend Chart */}
        <Card className={`border-2 backdrop-blur-xl shadow-xl transition-all mb-8 ${
          isDark 
            ? "border-blue-500/30 bg-slate-800/50 shadow-blue-500/10 hover:shadow-blue-500/20" 
            : "border-2 shadow-elegant bg-gradient-card"
        }`}>
          <CardHeader className={isDark ? "border-b border-slate-700/50" : ""}>
            <CardTitle className={`flex items-center gap-2 ${isDark ? "text-blue-100" : ""}`}>
              <div className={`p-2 rounded-lg ${
                isDark 
                  ? "bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30" 
                  : "bg-accent/10"
              }`}>
                <TrendingUp className={`h-5 w-5 ${isDark ? "text-blue-400" : "text-accent"}`} />
              </div>
              Time Trend - {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}
            </CardTitle>
            <CardDescription className={isDark ? "text-slate-400" : ""}>Your study time progression over time</CardDescription>
          </CardHeader>
          <CardContent>
            {getCurrentData() && getCurrentData().length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getCurrentData()}>
                    <defs>
                      <linearGradient id="timeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#475569" : "#e2e8f0"} opacity={0.3} />
                    <XAxis 
                      dataKey={timeRange === "daily" ? "day" : timeRange === "weekly" ? "week" : "month"}
                      stroke={isDark ? "#94a3b8" : "#64748b"}
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke={isDark ? "#94a3b8" : "#64748b"}
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      formatter={(value) => formatTime(Number(value))}
                      contentStyle={{ 
                        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)', 
                        border: isDark ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(59, 130, 246, 0.2)',
                        borderRadius: '8px',
                        color: isDark ? '#e2e8f0' : '#1e293b'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="time" 
                      stroke="#06b6d4" 
                      strokeWidth={2}
                      fill="url(#timeGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              ) : (
              <div className={`h-80 flex items-center justify-center ${isDark ? "text-slate-400" : "text-muted-foreground"}`}>
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>No data available for this time range</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className={`border-2 backdrop-blur-xl shadow-xl transition-all ${
          isDark 
            ? "border-green-500/30 bg-slate-800/50 shadow-green-500/10 hover:shadow-green-500/20" 
            : "border-2 shadow-elegant bg-gradient-card"
        }`}>
          <CardHeader className={isDark ? "border-b border-slate-700/50" : ""}>
            <CardTitle className={`flex items-center gap-2 ${isDark ? "text-green-100" : ""}`}>
              <div className={`p-2 rounded-lg ${
                isDark 
                  ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30" 
                  : "bg-green-100"
              }`}>
                <Activity className={`h-5 w-5 ${isDark ? "text-green-400" : "text-green-600"}`} />
              </div>
              Recent Activity
            </CardTitle>
            <CardDescription className={isDark ? "text-slate-400" : ""}>Your latest study sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {timeAnalyticsData.recentActivity && timeAnalyticsData.recentActivity.length > 0 ? (
                timeAnalyticsData.recentActivity.map((activity, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all group ${
                      isDark 
                        ? "bg-slate-700/30 border-slate-600/30 hover:bg-slate-700/50 hover:border-green-500/30" 
                        : "bg-muted/50 border-border hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg transition-colors ${
                        isDark 
                          ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 group-hover:border-green-400/50" 
                          : "bg-green-100"
                      }`}>
                        <BookOpen className={`h-5 w-5 ${isDark ? "text-green-400" : "text-green-600"}`} />
                      </div>
                      <div>
                        <h4 className={`font-semibold ${isDark ? "text-slate-200" : ""}`}>{activity.subject}</h4>
                        <p className={`text-sm ${isDark ? "text-slate-400" : "text-muted-foreground"}`}>{activity.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${isDark ? "text-green-300" : "text-green-600"}`}>{formatTime(activity.duration)}</div>
                      <div className={`text-xs ${isDark ? "text-slate-400" : "text-muted-foreground"}`}>{activity.time}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`text-center py-8 ${isDark ? "text-slate-400" : "text-muted-foreground"}`}>
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default TimeAnalytics;
