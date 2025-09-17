import api from './api';
import type { Course, CourseRequest, CourseStats } from '../types';

class CourseService {
  /**
   * Create a new course
   */
  async createCourse(courseData: CourseRequest): Promise<Course> {
    const response = await api.post('/courses', courseData);
    return response.data;
  }

  /**
   * Update an existing course
   */
  async updateCourse(courseId: number, courseData: CourseRequest): Promise<Course> {
    const response = await api.put(`/courses/${courseId}`, courseData);
    return response.data;
  }

  /**
   * Get all courses by current teacher
   */
  async getMyCourses(): Promise<Course[]> {
    const response = await api.get('/courses/my-courses');
    return response.data;
  }

  /**
   * Get active courses by current teacher
   */
  async getMyActiveCourses(): Promise<Course[]> {
    const response = await api.get('/courses/my-courses/active');
    return response.data;
  }

  /**
   * Get course by ID
   */
  async getCourseById(courseId: number): Promise<Course> {
    const response = await api.get(`/courses/${courseId}`);
    return response.data;
  }

  /**
   * Get all available courses (for students)
   */
  async getAvailableCourses(): Promise<Course[]> {
    const response = await api.get('/courses/available');
    return response.data;
  }

  /**
   * Search courses by title
   */
  async searchCourses(keyword: string): Promise<Course[]> {
    const response = await api.get(`/courses/search?keyword=${encodeURIComponent(keyword)}`);
    return response.data;
  }

  /**
   * Delete course
   */
  async deleteCourse(courseId: number): Promise<void> {
    await api.delete(`/courses/${courseId}`);
  }

  /**
   * Get teacher's course statistics
   */
  async getTeacherStats(): Promise<CourseStats> {
    const response = await api.get('/courses/stats');
    return response.data;
  }

  /**
   * Get all courses (admin only)
   */
  async getAllCourses(): Promise<Course[]> {
    const response = await api.get('/courses/all');
    return response.data;
  }
}

export default new CourseService();
