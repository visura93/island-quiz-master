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
  PieChart,
  Activity,
  Target,
  Zap,
  BookOpen,
  Award,
  School
} from "lucide-react";
import { 
  PieChart as RechartsPieChart, 
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
import { apiService, TimeAnalytics as TimeAnalyticsType } from "@/lib/api";

const TimeAnalytics = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
        setTimeAnalyticsData(analytics);
      } catch (err: any) {
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
    return Math.round(data.reduce((sum, item) => sum + item.time, 0) / data.length);
  };

  const getMostProductiveDay = () => {
    const data = getCurrentData();
    const maxTime = Math.max(...data.map(item => item.time));
    return data.find(item => item.time === maxTime);
  };

  return (
    <div className="min-h-screen bg-gradient-mesh">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/student-dashboard')}
                className="btn-modern"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                  Time Analytics
                </h1>
                <p className="text-muted-foreground">Track your learning progress and time investment</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading time analytics...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <Clock className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-semibold">Error loading data</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && timeAnalyticsData && (
          <>
            {/* Time Range Selector */}
            <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={timeRange === "daily" ? "default" : "outline"}
            onClick={() => setTimeRange("daily")}
            className="btn-modern"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Daily
          </Button>
          <Button
            variant={timeRange === "weekly" ? "default" : "outline"}
            onClick={() => setTimeRange("weekly")}
            className="btn-modern"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Weekly
          </Button>
          <Button
            variant={timeRange === "monthly" ? "default" : "outline"}
            onClick={() => setTimeRange("monthly")}
            className="btn-modern"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Monthly
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 shadow-elegant bg-gradient-card">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-primary/10 rounded-xl w-fit mx-auto mb-3">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary mb-1">
                {formatTime(getTotalTimeForRange())}
              </div>
              <p className="text-sm text-muted-foreground">Total Time</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-elegant bg-gradient-card">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-green-100 rounded-xl w-fit mx-auto mb-3">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {formatTime(getAverageTimePerSession())}
              </div>
              <p className="text-sm text-muted-foreground">Avg per Session</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-elegant bg-gradient-card">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-blue-100 rounded-xl w-fit mx-auto mb-3">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {getCurrentData().length}
              </div>
              <p className="text-sm text-muted-foreground">Sessions</p>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-elegant bg-gradient-card">
            <CardContent className="p-6 text-center">
              <div className="p-3 bg-purple-100 rounded-xl w-fit mx-auto mb-3">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {getMostProductiveDay()?.day || getMostProductiveDay()?.week || getMostProductiveDay()?.month}
              </div>
              <p className="text-sm text-muted-foreground">Most Productive</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Time Distribution by Subject */}
          <Card className="border-2 shadow-elegant bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Time by Subject
              </CardTitle>
              <CardDescription>Distribution of study time across subjects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <PieChart
                      data={timeAnalyticsData.subjectBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {timeAnalyticsData.subjectBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </PieChart>
                    <Tooltip formatter={(value) => formatTime(Number(value))} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {timeAnalyticsData.subjectBreakdown.map((subject) => (
                  <div key={subject.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: subject.color }}
                      />
                      <span className="text-sm font-medium">{subject.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatTime(subject.value)} ({subject.percentage}%)
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Time Distribution by Type */}
          <Card className="border-2 shadow-elegant bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-secondary" />
                Time by Quiz Type
              </CardTitle>
              <CardDescription>Distribution of study time across quiz types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <PieChart
                      data={timeAnalyticsData.typeBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {timeAnalyticsData.typeBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </PieChart>
                    <Tooltip formatter={(value) => formatTime(Number(value))} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {timeAnalyticsData.typeBreakdown.map((type) => (
                  <div key={type.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: type.color }}
                      />
                      <span className="text-sm font-medium">{type.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatTime(type.value)} ({type.percentage}%)
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Time Trend Chart */}
        <Card className="border-2 shadow-elegant bg-gradient-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Time Trend - {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}
            </CardTitle>
            <CardDescription>Your study time progression over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getCurrentData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={timeRange === "daily" ? "day" : timeRange === "weekly" ? "week" : "month"} />
                  <YAxis />
                  <Tooltip formatter={(value) => formatTime(Number(value))} />
                  <Area 
                    type="monotone" 
                    dataKey="time" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-2 shadow-elegant bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest study sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timeAnalyticsData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{activity.subject}</h4>
                      <p className="text-sm text-muted-foreground">{activity.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatTime(activity.duration)}</div>
                    <div className="text-xs text-muted-foreground">{activity.time}</div>
                  </div>
                </div>
              ))}
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
