import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import type { User } from '../../types';

interface StudentDashboard {
  message: string;
  availableCourses: number;
  enrolledCourses: number;
  completedCourses: number;
}

const StudentDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<StudentDashboard | null>(null);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [classmates, setClassmates] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'teachers' | 'classmates'>('overview');

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const [dashboardResponse, teachersResponse, classmatesResponse] = await Promise.all([
        api.get('/student/dashboard'),
        api.get('/student/teachers'),
        api.get('/student/classmates')
      ]);
      
      setDashboard(dashboardResponse.data);
      setTeachers(teachersResponse.data);
      setClassmates(classmatesResponse.data);
    } catch (err: any) {
      setError('Failed to load student data');
      console.error('Student data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-green-900 mb-2">Student Dashboard</h2>
        <p className="text-green-700">{dashboard?.message}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Available Courses</dt>
                  <dd className="text-lg font-medium text-gray-900">{dashboard?.availableCourses}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">E</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Enrolled Courses</dt>
                  <dd className="text-lg font-medium text-gray-900">{dashboard?.enrolledCourses}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">C</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Completed Courses</dt>
                  <dd className="text-lg font-medium text-gray-900">{dashboard?.completedCourses}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('teachers')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'teachers'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Teachers
            </button>
            <button
              onClick={() => setActiveTab('classmates')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'classmates'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Classmates
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Learning Overview</h3>
              <div className="text-gray-600">
                <p>Welcome to your learning journey! Here you can track your progress and manage your courses.</p>
                <div className="mt-4 space-y-2">
                  <p>• Browse available courses in the catalog</p>
                  <p>• Enroll in courses that interest you</p>
                  <p>• Track your learning progress</p>
                  <p>• Connect with teachers and classmates</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'teachers' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Your Teachers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teachers.map((teacher) => (
                  <div key={teacher.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-900">
                      {teacher.firstName} {teacher.lastName}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{teacher.email}</div>
                    <div className="text-sm text-gray-500">@{teacher.username}</div>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 mt-2">
                      Teacher
                    </span>
                  </div>
                ))}
                {teachers.length === 0 && (
                  <div className="col-span-3 text-center text-gray-500">
                    No teachers found
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'classmates' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Your Classmates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classmates.map((classmate) => (
                  <div key={classmate.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-900">
                      {classmate.firstName} {classmate.lastName}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{classmate.email}</div>
                    <div className="text-sm text-gray-500">@{classmate.username}</div>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 mt-2">
                      Student
                    </span>
                  </div>
                ))}
                {classmates.length === 0 && (
                  <div className="col-span-3 text-center text-gray-500">
                    No classmates found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
