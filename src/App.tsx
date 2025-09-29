import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import DashboardRouter from './components/DashboardRouter';
import Settings from './components/admin/Settings';
import StudentSettings from './components/student/Settings';
import Lessons from './components/teacher/Lessons';
import LessonContents from './components/teacher/Lessoncontents';
import MyCourses from "./components/student/MyCourses";
import CoursePlayer from "./components/student/CoursePlayer";
import AllCourses from "./components/student/AllCourses";
import { Role } from './types';
import './App.css';
const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const getRedirectPath = () => {
    const role = localStorage.getItem("role");
    if (role === "ADMIN" || role === "TEACHER") {
      return "/dashboard";
    } else  {
      return "/student/all-courses";
    }
  };


  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={getRedirectPath()} replace />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to={getRedirectPath()} replace />
          ) : (
            <Register />
          )
        }
      />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={[Role.ADMIN, Role.TEACHER]}>
            <DashboardRouter />
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      {/* <Route 
        path="/admin/courses" 
        element={
          <ProtectedRoute allowedRoles={[Role.ADMIN]}>
            <CourseManagement />
          </ProtectedRoute>
        } 
      /> */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute
            allowedRoles={[Role.ADMIN, Role.TEACHER, Role.STUDENT]}
          >
            {user?.role === Role.ADMIN || user?.role === Role.TEACHER ? (
              <Settings />
            ) : user?.role === Role.STUDENT ? (
              <StudentSettings />
            ) : (
              <Login />
            )}
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={[Role.ADMIN]}>
            <DashboardRouter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:courseId/lessons"
        element={
          <ProtectedRoute allowedRoles={[Role.TEACHER]}>
            <Lessons />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lessons/:lessonId/contents"
        element={
          <ProtectedRoute allowedRoles={[Role.TEACHER]}>
            <LessonContents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/*"
        element={
          <ProtectedRoute allowedRoles={[Role.TEACHER, Role.ADMIN]}>
            <DashboardRouter />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/*"
        element={
          <ProtectedRoute
            allowedRoles={[Role.STUDENT, Role.TEACHER, Role.ADMIN]}
          >
            <DashboardRouter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/my-courses"
        element={
          <ProtectedRoute allowedRoles={[Role.STUDENT]}>
            <MyCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/courses/:courseId/play"
        element={
          <ProtectedRoute allowedRoles={[Role.STUDENT]}>
            <CoursePlayer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/all-courses"
        element={
          <ProtectedRoute allowedRoles={[Role.STUDENT]}>
            <AllCourses />
          </ProtectedRoute>
        }
      />
      {/* Landing page */}
      <Route path="/" element={<LandingPage />} />

      {/* Catch-all route */}
      <Route
        path="*"
        element={
          <div className="min-h-screen w-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                404 - Page Not Found
              </h1>
              <p className="text-gray-600 mb-8">
                The page you're looking for doesn't exist.
              </p>
              <button
                onClick={() => window.history.back()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Go Back
              </button>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <AppContent />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
