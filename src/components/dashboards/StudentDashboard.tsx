import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import type { User, Course, EnrollmentStats } from '../../types';
import enrollmentService from '../../services/enrollmentService';

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
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [enrollmentStats, setEnrollmentStats] = useState<EnrollmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'teachers' | 'classmates'>('overview');

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const [dashboardResponse, teachersResponse, classmatesResponse, enrolledCoursesResponse, enrollmentStatsResponse] = await Promise.all([
        api.get('/student/dashboard'),
        api.get('/student/teachers'),
        api.get('/student/classmates'),
        enrollmentService.getMyEnrolledCourses(),
        enrollmentService.getEnrollmentStats()
      ]);
      
      setDashboard(dashboardResponse.data);
      setTeachers(teachersResponse.data);
      setClassmates(classmatesResponse.data);
      setEnrolledCourses(enrolledCoursesResponse);
      setEnrollmentStats(enrollmentStatsResponse);
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <dd className="text-lg font-medium text-gray-900">{enrollmentStats?.activeEnrollments || 0}</dd>
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
                  <dd className="text-lg font-medium text-gray-900">{enrollmentStats?.completedEnrollments || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">T</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Enrollments</dt>
                  <dd className="text-lg font-medium text-gray-900">{enrollmentStats?.totalEnrollments || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold">P</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg Progress</dt>
                  <dd className="text-lg font-medium text-gray-900">{enrollmentStats?.averageProgress || 0}%</dd>
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
              onClick={() => setActiveTab('courses')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'courses'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Courses
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

          {activeTab === 'courses' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">My Enrolled Courses</h3>
              {enrolledCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledCourses.map((course) => (
                    <div key={course.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h4>
                      {course.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>
                      )}
                      <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                          </svg>
                          <span>Teacher: {course.teacher?.firstName} {course.teacher?.lastName}</span>
                        </div>
                        {course.durationHours && (
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <span>{course.durationHours} hours</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{course.currentStudents} students enrolled</span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors">
                          Continue Learning
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg mb-4">No courses enrolled yet</div>
                  <p className="text-gray-400 mb-6">Browse and enroll in courses to start learning!</p>
                  <button className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors">
                    Browse Courses
                  </button>
                </div>
              )}
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
