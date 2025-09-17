import React, { useState, useEffect } from 'react';
import type { Course, CourseRequest } from '../../types';
import courseService from '../../services/courseService';
import CourseForm from './CourseForm';
import CourseList from './CourseList';

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await courseService.getMyCourses();
      setCourses(data);
    } catch (err: any) {
      setError('Failed to load courses');
      console.error('Course fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (courseData: CourseRequest) => {
    try {
      const newCourse = await courseService.createCourse(courseData);
      setCourses(prev => [newCourse, ...prev]);
      setShowForm(false);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create course');
    }
  };

  const handleUpdateCourse = async (courseData: CourseRequest) => {
    if (!editingCourse) return;
    
    try {
      const updatedCourse = await courseService.updateCourse(editingCourse.id, courseData);
      setCourses(prev => prev.map(course => 
        course.id === updatedCourse.id ? updatedCourse : course
      ));
      setEditingCourse(null);
      setShowForm(false);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update course');
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    
    try {
      await courseService.deleteCourse(courseId);
      setCourses(prev => prev.filter(course => course.id !== courseId));
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete course');
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCourse(null);
    setError('');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading courses...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create New Course
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Course Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingCourse ? 'Edit Course' : 'Create New Course'}
              </h3>
              <CourseForm
                course={editingCourse}
                onSubmit={editingCourse ? handleUpdateCourse : handleCreateCourse}
                onCancel={handleCancelForm}
              />
            </div>
          </div>
        </div>
      )}

      {/* Course List */}
      <CourseList
        courses={courses}
        onEdit={handleEditCourse}
        onDelete={handleDeleteCourse}
      />
    </div>
  );
};

export default CourseManagement;
