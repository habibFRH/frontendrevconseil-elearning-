import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import AdminDashboard from './dashboards/AdminDashboard';
import TeacherDashboard from './dashboards/TeacherDashboard';
import StudentDashboard from './dashboards/StudentDashboard';
import Navbar from './common/Navbar';

const Dashboard: React.FC = () => {
  const { user, hasRole } = useAuth();

  const renderDashboard = () => {
    if (hasRole(Role.ADMIN)) {
      return <AdminDashboard />;
    } else if (hasRole(Role.TEACHER)) {
      return <TeacherDashboard />;
    } else if (hasRole(Role.STUDENT)) {
      return <StudentDashboard />;
    }
    return <div>Unknown role</div>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="mt-2 text-gray-600">
              You are logged in as {user?.role.toLowerCase()}
            </p>
          </div>
          {renderDashboard()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
