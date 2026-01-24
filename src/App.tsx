import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import StudentProfile from "./pages/StudentProfile";
import CreateQuiz from "./pages/CreateQuiz";
import ViewQuizzes from "./pages/ViewQuizzes";
import EditQuiz from "./pages/EditQuiz";
import ManageSubjects from "./pages/ManageSubjects";
import ManageStudents from "./pages/ManageStudents";
import Quiz from "./pages/Quiz";
import CompletedQuizzes from "./pages/CompletedQuizzes";
import TimeAnalytics from "./pages/TimeAnalytics";
import Payment from "./pages/Payment";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route 
              path="/student-dashboard" 
              element={
                <ProtectedRoute requiredRole="Student">
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/teacher-dashboard" 
              element={
                <ProtectedRoute requiredRole="Teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-dashboard" 
              element={
                <ProtectedRoute requiredRole="Admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/student/:studentId" 
              element={
                <ProtectedRoute requiredRole="Admin">
                  <StudentProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/create-quiz" 
              element={
                <ProtectedRoute requiredRole="Admin">
                  <CreateQuiz />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/quizzes" 
              element={
                <ProtectedRoute requiredRole="Admin">
                  <ViewQuizzes />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/edit-quiz/:quizId"
              element={
                <ProtectedRoute requiredRole="Admin">
                  <EditQuiz />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/manage-subjects"
              element={
                <ProtectedRoute requiredRole="Admin">
                  <ManageSubjects />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/manage-students"
              element={
                <ProtectedRoute requiredRole="Admin">
                  <ManageStudents />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/quiz" 
              element={
                <ProtectedRoute requiredRole="Student">
                  <Quiz />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/completed-quizzes" 
              element={
                <ProtectedRoute requiredRole="Student">
                  <CompletedQuizzes />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/time-analytics" 
              element={
                <ProtectedRoute requiredRole="Student">
                  <TimeAnalytics />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/payment" 
              element={
                <ProtectedRoute requiredRole="Student">
                  <Payment />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
