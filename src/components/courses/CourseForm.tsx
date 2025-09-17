import React, { useState, useEffect } from 'react';
import type { Course, CourseRequest } from '../../types';

interface CourseFormProps {
  course?: Course | null;
  onSubmit: (courseData: CourseRequest) => void;
  onCancel: () => void;
}

const CourseForm: React.FC<CourseFormProps> = ({ course, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<CourseRequest>({
    title: '',
    description: '',
    durationHours: undefined,
    maxStudents: undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description || '',
        durationHours: course.durationHours,
        maxStudents: course.maxStudents,
      });
    }
  }, [course]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'durationHours' || name === 'maxStudents' 
        ? value === '' ? undefined : parseInt(value) 
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Course Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          value={formData.title}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Enter course title"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Enter course description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="durationHours" className="block text-sm font-medium text-gray-700">
            Duration (Hours)
          </label>
          <input
            type="number"
            id="durationHours"
            name="durationHours"
            min="1"
            value={formData.durationHours || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Hours"
          />
        </div>

        <div>
          <label htmlFor="maxStudents" className="block text-sm font-medium text-gray-700">
            Max Students
          </label>
          <input
            type="number"
            id="maxStudents"
            name="maxStudents"
            min="1"
            value={formData.maxStudents || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Max students"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting 
            ? (course ? 'Updating...' : 'Creating...') 
            : (course ? 'Update Course' : 'Create Course')
          }
        </button>
      </div>
    </form>
  );
};

export default CourseForm;
