import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'Student' | 'Teacher' | 'Admin';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute render:', { 
    isAuthenticated, 
    user, 
    userRole: user?.role, 
    requiredRole, 
    isLoading 
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== undefined) {
    // Convert user role to string for comparison
    let userRoleString: string;
    if (typeof user.role === 'number') {
      // Map numeric roles: 0 = Student, 1 = Teacher, 2 = Admin
      const roleMap: { [key: number]: string } = {
        0: 'Student',
        1: 'Teacher', 
        2: 'Admin'
      };
      userRoleString = roleMap[user.role] || 'Student';
    } else if (typeof user.role === 'string') {
      userRoleString = user.role;
    } else {
      userRoleString = 'Student'; // fallback
    }

    // Check if user has the required role
    if (userRoleString !== requiredRole) {
      // Redirect to appropriate dashboard based on user role
      let dashboardRole: string;
      if (typeof user.role === 'number') {
        const roleMap: { [key: number]: string } = {
          0: 'student',
          1: 'teacher', 
          2: 'admin'
        };
        dashboardRole = roleMap[user.role] || 'student';
      } else if (typeof user.role === 'string') {
        dashboardRole = user.role.toLowerCase();
      } else {
        dashboardRole = 'student'; // fallback
      }
      const dashboardPath = `/${dashboardRole}-dashboard`;
      return <Navigate to={dashboardPath} replace />;
    }
  }

  return <>{children}</>;
};
