import api from './api';
import type { Lesson, LessonRequest, LessonContent, LessonContentRequest } from '../types';

class LessonService {
  /**
   * Create a new lesson for a course
   */
  async createLesson(courseId: number, data: LessonRequest): Promise<Lesson> {
    const response = await api.post(`/lessons/course/${courseId}`, data);
    return response.data;
  }

  /**
   * Update an existing lesson
   */
  async updateLesson(lessonId: number, data: LessonRequest): Promise<Lesson> {
    const response = await api.put(`/lessons/${lessonId}`, data);
    return response.data;
  }

  /**
   * Get all lessons for a course (teacher/admin view)
   */
  async getLessonsByCourse(courseId: number): Promise<Lesson[]> {
    const response = await api.get(`/lessons/course/${courseId}`);
    return response.data;
  }

  /**
   * Get published lessons for a course (public/student view)
   */
  async getPublishedLessons(courseId: number): Promise<Lesson[]> {
    const response = await api.get(`/lessons/course/${courseId}/published`);
    return response.data;
  }

  /**
   * Get lesson by ID
   */
  async getLessonById(lessonId: number): Promise<Lesson> {
    const response = await api.get(`/lessons/${lessonId}`);
    return response.data;
  }

  /**
   * Delete lesson
   */
  async deleteLesson(lessonId: number): Promise<void> {
    await api.delete(`/lessons/${lessonId}`);
  }

  // ---- Lesson Content ----

  /**
   * Add content to lesson
   */
  async addContent(lessonId: number, data: LessonContentRequest): Promise<LessonContent> {
    const response = await api.post(`/lessons/${lessonId}/content`, data);
    return response.data;
  }

  /**
   * Update lesson content
   */
  async updateContent(contentId: number, data: LessonContentRequest): Promise<LessonContent> {
    const response = await api.put(`/lessons/content/${contentId}`, data);
    return response.data;
  }

  /**
   * Get all content for a lesson
   */
  async getLessonContent(lessonId: number): Promise<LessonContent[]> {
    const response = await api.get(`/lessons/${lessonId}/content`);
    return response.data;
  }

  /**
   * Delete lesson content
   */
  async deleteContent(contentId: number): Promise<void> {
    await api.delete(`/lessons/content/${contentId}`);
  }
}

export default new LessonService();
