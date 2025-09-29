import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import courseService from '../../services/courseService';
import type { Course, CourseStats, } from '../../types';
import CourseAddDialog, { type CourseCreateData } from '../common/CourseAddDialog';
import { useToast } from '../../hooks/useToast';
import ConfirmDialog from '../common/ConfirmDialog';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon,  
  PencilIcon, 
  TrashIcon, 
  ChartBarIcon,
  UsersIcon,
  ClockIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import CourseEditDialog, { type CourseUpdateData } from '../common/CourseEditDialog';

const TeacherDashboard: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<CourseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const navigate = useNavigate();

  const handleGoToLessons = (courseId: number) => {
    navigate(`/courses/${courseId}/lessons`);
  };

  // Dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'delete' | null;
    course: Course | null;
    courseInput: string;
  }>({
    isOpen: false,
    type: null,
    course: null,
    courseInput: ''
  });

  const { success, error: showError } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesData, statsData] = await Promise.all([
        courseService.getMyCourses(),
        courseService.getTeacherStats()
      ]);
      setCourses(coursesData);
      setStats(statsData);
    } catch (err) {
      setError('Failed to load courses');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };
    // Add dialog state
  const [addDialog, setAddDialog] = useState<{
    isOpen: boolean;
  }>({
    isOpen: false
  });
  const [editDialog, setEditDialog] = useState<{
    isOpen: boolean;
    course: Course | null;
  }>({
    isOpen: false,
    course: null
  });
  const handleCreateCourse = async (userData: CourseCreateData) => {
    try {
      await courseService.createCourse(userData);
      success(`Course ${userData.title} created successfully`);
      await fetchData(); // Refresh the data
      setAddDialog({ isOpen: false });
    } catch (err) {
      console.error('Error creating course:', err);
      showError('Failed to create course');
    }
  };

  const handleSaveCourse = async (courseId: number, courseData: CourseUpdateData) => {
    try {
      await courseService.updateCourse(courseId, courseData);
      success(`Course ${courseData.title} updated successfully`);
      await fetchData(); // Refresh the data
      setEditDialog({ isOpen: false, course: null });
    } catch (err) {
      console.error('Error updating course:', err);
      showError('Failed to update course');
    }
  };


  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Published' : 'Draft';
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (course.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'ALL' || 
                         (filterStatus === 'PUBLISHED' && course.isActive) ||
                         (filterStatus === 'DRAFT' && !course.isActive);
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading your courses...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </DashboardLayout>
    );
  }
  const handleAddCourse = () => {
    console.log('Opening add course dialog');
    setAddDialog({ isOpen: true });
  }

 const handleConfirmAction = async () => {
  if (!confirmDialog.course) return;

  try {
    if (confirmDialog.type === 'delete') {
      await courseService.deleteCourse(confirmDialog.course.id);
      success(`Course "${confirmDialog.course.title}" deleted successfully`);
      await fetchData(); // refresh after delete
    }
  } catch (err) {
    console.error(`Error ${confirmDialog.type === 'delete' ? 'deleting' : 'updating'} course:`, err);
    showError(`Failed to ${confirmDialog.type === 'delete' ? 'delete' : 'update'} course`);
  } finally {
    setConfirmDialog({ isOpen: false, type: null, course: null, courseInput: '' });
  }
};

  
  const handleCancelAction = () => {
    setConfirmDialog({ isOpen: false, type: null, course: null, courseInput: '' });
  };

 const getDialogProps = () => {
  if (!confirmDialog.course || !confirmDialog.type) {
    return { title: '', message: '' };
  }

  if (confirmDialog.type === 'delete') {
    return {
      title: 'Delete Course',
      message: `Are you sure you want to permanently delete "${confirmDialog.course.title}"?
      
      This action cannot be undone and will:
      • Remove all course data
      • Delete all course enrollments
      • Remove the course permanently`,
            confirmText: 'Delete Course',
      type: 'danger' as const,
      requireTextConfirmation: true, // set to true if you want "type DELETE"
    };
  }

  return { title: '', message: '' };
};


  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg shadow-md p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Welcome back, Teacher!</h1>
          <p className="text-yellow-100">Manage your courses and track student progress from your dashboard.</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <AcademicCapIcon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Courses</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalCourses}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <ChartBarIcon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.activeCourses}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <ClockIcon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Draft</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalCourses - stats.activeCourses}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <UsersIcon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label htmlFor="search-courses" className="block text-sm font-medium text-gray-700 mb-2">Search Courses</label>
              <input
                id="search-courses"
                type="text"
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
              />
            </div>
            
            <div>
              <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                id="filter-status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-black"
              >
                <option value="ALL">All Status</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
    {/* Add New Course */}
    <div className="flex items-end">
      <button
        onClick={handleAddCourse}
        className="bg-green-500 hover:bg-green-600 w-full text-white px-4 py-2 rounded-md transition-colors"
        title="Create a new course"
      >
        Add New Course
      </button>
    </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div 
              key={course.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg cursor-pointer hover:scale-105 transition-transform"
            >
              {/* Course Image Placeholder */}
              <div 
                key={course.id} 
                className="h-48 bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center"
                onClick={() => handleGoToLessons(course.id)}
              >
                <AcademicCapIcon className="w-16 h-16 text-white" />
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(course.isActive)}`}>
                    {getStatusText(course.isActive)}
                  </span>
                  <span className="text-sm font-medium text-gray-600">
                    {course.durationHours || 0}h
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{course.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <UsersIcon className="w-4 h-4 mr-2" />
                    {course.currentStudents || 0} students enrolled
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <ClockIcon className="w-4 h-4 mr-2" />
                    Created {new Date(course.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex space-x-2">                  
                  <button 
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-center"
                    title="Edit course"
                    onClick={() => setEditDialog({ isOpen: true, course })}
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  
                  <button 
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-center"
                    onClick={() => setConfirmDialog({ isOpen: true, type: 'delete', course, courseInput: '' })}
                    title="Delete course"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

 ...

{filteredCourses.length === 0 && (
  <div className="bg-white rounded-lg shadow-md p-12 text-center">
    <AcademicCapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      {searchTerm || filterStatus !== 'ALL' ? 'No courses found' : 'No courses yet'}
    </h3>
    <p className="text-gray-500 mb-6">
      {searchTerm || filterStatus !== 'ALL' 
        ? 'Try adjusting your search criteria or filters.' 
        : 'Start creating your first course to share your knowledge with students.'}
    </p>
    {!searchTerm && filterStatus === 'ALL' && (
      <button 
        onClick={handleAddCourse}
        className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-md transition-colors flex items-center mx-auto"
      >
        <PlusIcon className="h-5 w-5 mr-2" />
        Create Your First Course
      </button>
    )}
  </div>
)}


      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
        userInput={confirmDialog.courseInput}
        onInputChange={(value) => setConfirmDialog(prev => ({ ...prev, courseInput: value }))}
        {...getDialogProps()}
      />

  {/* Add Course Dialog */}
  <CourseAddDialog
    isOpen={addDialog.isOpen}
    onSave={handleCreateCourse}
    onCancel={() => setAddDialog({ isOpen: false })}
  />
  {/* Course Edit Dialog */}
  <CourseEditDialog
    isOpen={editDialog.isOpen}
    course={editDialog.course}
    onSave={handleSaveCourse}
    onCancel={() => setEditDialog({ isOpen: false, course: null })}
  />  

  </div>
</DashboardLayout>


    
  );
};



export default TeacherDashboard;
