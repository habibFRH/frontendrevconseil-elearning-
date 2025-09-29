/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import lessonService from '../../services/lessonService';
import type { Lesson } from '../../types';
import { useToast } from '../../hooks/useToast';
import ConfirmDialog from '../common/ConfirmDialog';
import { 
  PlusIcon,  
  PencilIcon, 
  TrashIcon,
  ClockIcon,
  BookOpenIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import LessonAddDialog, { type LessonCreateData } from '../common/LessonAddDialog';
import LessonEditDialog, { type LessonUpdateData } from '../common/LessonEditDialog';

const Lessons: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [addDialog, setAddDialog] = useState<{
    isOpen: boolean;
  }>({
    isOpen: false
  });
  const [editDialog, setEditDialog] = useState<{
    isOpen: boolean;
    lesson: Lesson | null;
  }>({
    isOpen: false,
    lesson: null
  });
  const [editForm, setEditForm] = useState<LessonUpdateData>({
    title: '',
    description: '',
    isPublished: false,
    isFree: false,
    lessonOrder: 1,
    duration: 1,
  });
  const [editErrors, setEditErrors] = useState<Partial<Record<keyof LessonUpdateData, string>>>({});
  const [editSaving, setEditSaving] = useState(false);
  // Dialog state for delete confirm
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    lesson: Lesson | null;
    lessonInput: string | null;
  }>({
    isOpen: false,
    lesson: null as Lesson | null,
    lessonInput: null as string | null
  });

  const { success, error: showError } = useToast();

  useEffect(() => {
    if (courseId) fetchLessons(Number(courseId));
  }, [courseId]);

  const fetchLessons = async (id: number) => {
    try {
      setLoading(true);
      const lessonsData = await lessonService.getLessonsByCourse(id);
      setLessons(lessonsData);
    } catch (err) {
      setError('Failed to load lessons');
      console.error('Error fetching lessons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async () => {
    if (!confirmDialog.lesson) return;
    try {
      await lessonService.deleteLesson(confirmDialog.lesson.id);
      success(`Lesson "${confirmDialog.lesson.title}" deleted successfully`);
      await fetchLessons(Number(courseId));
    } catch (err) {
      console.error('Error deleting lesson:', err);
      showError('Failed to delete lesson');
    } finally {
      setConfirmDialog({ isOpen: false, lesson: null, lessonInput: null });
    }
  };

  const handleCreateLesson = async (lessonData: LessonCreateData) => {
    try {
      // Map dialog data to API shape (LessonRequest)
      const payload = {
        title: lessonData.title,
        description: lessonData.description,
        lessonOrder: Number(lessonData.lessonOrder),
        durationMinutes: Number(lessonData.duration),
        isFree: !!lessonData.isFree,
        isPublished: !!lessonData.isPublished,
      };
      await lessonService.createLesson(Number(courseId), payload);
      success(`Lesson "${lessonData.title}" created successfully`);
      await fetchLessons(Number(courseId));
      setAddDialog({ isOpen: false });
    } catch (err) {
      console.error('Error creating lesson:', err);
      showError('Failed to create lesson');
    }
  };

  const handleCancelAdd = () => {
    setAddDialog({ isOpen: false });
  };

  const openEditDialog = (lesson: Lesson) => {
    setEditDialog({ isOpen: true, lesson });
    setEditForm({
      title: lesson.title || '',
      description: lesson.description || '',
      isPublished: !!lesson.isPublished,
      isFree: !!lesson.isFree,
      lessonOrder: typeof lesson.lessonOrder === 'number' ? lesson.lessonOrder : 1,
      duration: typeof lesson.durationMinutes === 'number' ? lesson.durationMinutes : 1,
    });
    setEditErrors({});
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, type } = e.target as HTMLInputElement;
    const value = type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }) as LessonUpdateData);
    if (editErrors[name as keyof LessonUpdateData]) {
      setEditErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDialog.lesson) return;

    // Basic validation
    const newErrors: Partial<Record<keyof LessonUpdateData, string>> = {};
    if (!editForm.title.trim()) newErrors.title = 'Title is required';
    if (!editForm.description.trim()) newErrors.description = 'Description is required';
    setEditErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setEditSaving(true);
      const payload = {
        title: editForm.title,
        description: editForm.description,
        lessonOrder: Number(editForm.lessonOrder),
        durationMinutes: Number(editForm.duration),
        isFree: !!editForm.isFree,
        isPublished: !!editForm.isPublished,
      };
      await lessonService.updateLesson(editDialog.lesson.id, payload as any);
      success(`Lesson "${editForm.title}" updated successfully`);
      await fetchLessons(Number(courseId));
      setEditDialog({ isOpen: false, lesson: null });
    } catch (err) {
      console.error('Error editing lesson:', err);
      showError('Failed to edit lesson');
    } finally {
      setEditSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditDialog({ isOpen: false, lesson: null });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading lessons...</div>
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Lessons for Course {courseId}</h1>
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center"
            onClick={() => setAddDialog({ isOpen: true })}
            >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Lesson
          </button>
        </div>

        {/* Lessons List */}
        {lessons.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons yet</h3>
            <p className="text-gray-500 mb-6">
              Start by creating your first lesson for this course.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                   {lessons.map((lesson) => (
                     <tr
                       key={lesson.id}
                       className="hover:bg-gray-50 cursor-pointer"
                       onClick={(e) => {
                         // Avoid row click when clicking action buttons
                         const target = e.target as HTMLElement;
                         if (target.closest('button')) return;
                         navigate(`/lessons/${lesson.id}/contents`);
                       }}
                     >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left">
                        #{lesson.lessonOrder || 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 text-left">{lesson.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate text-left">{lesson.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {lesson.durationMinutes || 1} min
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {lesson.isPublished ? (
                            <>
                              <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                              <span className="text-sm text-green-600">Published</span>
                            </>
                          ) : (
                            <>
                              <XCircleIcon className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-sm text-gray-500">Draft</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(lesson.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2 justify-end">
                          <button 
                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md transition-colors"
                            title="Edit lesson"
                            onClick={() => openEditDialog(lesson)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          
                          <button 
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md transition-colors"
                            onClick={() => setConfirmDialog({ isOpen: true, lesson, lessonInput: null })}
                            title="Delete lesson"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onConfirm={handleDeleteLesson}
          onCancel={() => setConfirmDialog({ isOpen: false, lesson: null, lessonInput: null })}
          userInput={confirmDialog.lessonInput || ''}
          onInputChange={(value) => setConfirmDialog(prev => ({ ...prev, lessonInput: value }))}
          title="Delete Lesson"
          message={`Are you sure you want to permanently delete "${confirmDialog.lesson?.title}"? This cannot be undone.`}
          confirmText="Delete Lesson"
          type="danger"
        />

        {/* Lesson Add Dialog */}
        <LessonAddDialog
          isOpen={addDialog.isOpen}
          onSave={handleCreateLesson}
          onCancel={handleCancelAdd}
        />

        {/* Lesson Edit Dialog */}
        <LessonEditDialog
          isOpen={editDialog.isOpen}
          lesson={editDialog.lesson as Lesson}
          formData={editForm}
          errors={editErrors}
          saving={editSaving}
          onSubmit={handleEditSubmit}
          onCancel={handleCancelEdit}
          onChange={handleEditChange}
        />

      </div>
    </DashboardLayout>
  );
};

export default Lessons;