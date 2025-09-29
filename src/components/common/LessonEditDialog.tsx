import React from 'react';
import type { Lesson} from '../../types';

interface LessonEditDialogProps {
  isOpen: boolean;
  lesson: Lesson;
  formData: LessonUpdateData;
  errors: Partial<Record<keyof LessonUpdateData, string>>;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export interface LessonUpdateData { title: string; description: string; isPublished: boolean; isFree: boolean; lessonOrder: number; duration: number; }

const LessonEditDialog: React.FC<LessonEditDialogProps> = ({
  isOpen,
  lesson,
  formData,
  errors,
  saving,
  onCancel,
  onSubmit,
  onChange
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-black opacity-70 transition-opacity"
          onClick={onCancel}
        />

        {/* Center modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="relative inline-block align-bottom bg-white rounded-lg px-6 pt-5 pb-4 text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-8">
          <form onSubmit={onSubmit}>
            {/* Header */}
            <div className="sm:flex sm:items-start mb-6">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                  Edit Lesson Information
                </h3>
                <p className="text-sm text-gray-500">
                  Update lesson details and settings.
                </p>
              </div>
            </div>

            {/* Form Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={onChange}
                  className={`w-full text-black px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? 'border-red-300 focus:ring-red-400' : 'border-gray-300'
                  }`}
                />
                {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={onChange}
                  className={`w-full px-3 text-black py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? 'border-red-300 focus:ring-red-400' : 'border-gray-300'
                  }`}
                />
                {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
              </div>

              {/* Published */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={onChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isPublished" className="text-sm text-gray-700">Published</label>
              </div>

              {/* Free */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isFree"
                  name="isFree"
                  checked={formData.isFree}
                  onChange={onChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isFree" className="text-sm text-gray-700">Free Lesson</label>
              </div>

              {/* Lesson Order */}
              <div>
                <label htmlFor="lessonOrder" className="block text-sm font-medium text-gray-700 mb-1">
                  Lesson Order
                </label>
                <input
                  type="number"
                  id="lessonOrder"
                  name="lessonOrder"
                  value={formData.lessonOrder}
                  onChange={onChange}
                  className="w-full px-3 text-black py-2 border rounded-md focus:ring-2 focus:ring-blue-500 border-gray-300"
                />
              </div>

              {/* Duration */}
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={onChange}
                  className="w-full px-3 text-black py-2 border rounded-md focus:ring-2 focus:ring-blue-500 border-gray-300"
                />
              </div>
            </div>

            {/* Current Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
              <h4 className="font-medium text-gray-900 mb-2">Current Lesson Info</h4>
              <div className="grid grid-cols-2 gap-2 text-gray-600">
                <div>ID: {lesson.id}</div>
                <div>Created: {new Date(lesson.createdAt).toLocaleDateString()}</div>
                <div>Updated: {lesson.updatedAt ? new Date(lesson.updatedAt).toLocaleDateString() : 'Never'}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={saving}
                className={`w-full sm:w-auto inline-flex justify-center rounded-md px-4 py-2 text-sm font-medium text-white focus:ring-2 focus:ring-offset-2 ${
                  saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                }`}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={saving}
                className="mt-3 sm:mt-0 sm:w-auto w-full inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LessonEditDialog;
