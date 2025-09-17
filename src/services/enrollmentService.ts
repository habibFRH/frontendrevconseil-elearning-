import api from './api';
import type { Course, Enrollment, EnrollmentRequest, EnrollmentStats } from '../types';

class EnrollmentService {
  /**
   * Enroll in a course
   */
  async enrollInCourse(enrollmentData: EnrollmentRequest): Promise<Enrollment> {
    const response = await api.post('/enrollments', enrollmentData);
    return response.data;
  }

  /**
   * Unenroll from a course
   */
  async unenrollFromCourse(courseId: number): Promise<void> {
    await api.delete(`/enrollments/course/${courseId}`);
  }

  /**
   * Get my enrollments
   */
  async getMyEnrollments(): Promise<Enrollment[]> {
    const response = await api.get('/enrollments/my-enrollments');
    return response.data;
  }

  /**
   * Get my active enrollments
   */
  async getMyActiveEnrollments(): Promise<Enrollment[]> {
    const response = await api.get('/enrollments/my-enrollments/active');
    return response.data;
  }

  /**
   * Get my enrolled courses
   */
  async getMyEnrolledCourses(): Promise<Course[]> {
    const response = await api.get('/enrollments/my-courses');
    return response.data;
  }

  /**
   * Get my completed courses
   */
  async getMyCompletedCourses(): Promise<Enrollment[]> {
    const response = await api.get('/enrollments/my-courses/completed');
    return response.data;
  }

  /**
   * Check if enrolled in course
   */
  async checkEnrollment(courseId: number): Promise<boolean> {
    const response = await api.get(`/enrollments/check/${courseId}`);
    return response.data.enrolled;
  }

  /**
   * Update course progress
   */
  async updateProgress(courseId: number, progress: number): Promise<void> {
    await api.put(`/enrollments/course/${courseId}/progress?progress=${progress}`);
  }

  /**
   * Get enrollment statistics
   */
  async getEnrollmentStats(): Promise<EnrollmentStats> {
    const response = await api.get('/enrollments/stats');
    return response.data;
  }

  /**
   * Get course enrollments (for teachers)
   */
  async getCourseEnrollments(courseId: number): Promise<Enrollment[]> {
    const response = await api.get(`/enrollments/course/${courseId}`);
    return response.data;
  }
}

export default new EnrollmentService();
