import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import AdminDashboard from './dashboards/AdminDashboard';
import TeacherDashboard from './dashboards/TeacherDashboard';
import StudentDashboard from './dashboards/StudentDashboard';
// import UserManagement from './admin/UserManagement';

const DashboardRouter: React.FC = () => {
  const { hasRole } = useAuth();

  if (hasRole(Role.ADMIN)) {
    return <AdminDashboard />;
  } else if (hasRole(Role.TEACHER)) {
    return <TeacherDashboard />;
  } else if (hasRole(Role.STUDENT)) {
    return <StudentDashboard />;
  }
  
  // Fallback for unauthenticated or unknown roles
  return (
    <div className="min-h-screen w-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600">You don't have permission to access this page.</p>
      </div>
    </div>
  );
};

export default DashboardRouter;
