/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api';
import type { User } from '../types';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  students: number;
  teachers: number;
  admins: number;
}

export interface AdminUser extends Omit<User, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

export interface AdminCourse {
  id: number;
  title: string;
  description: string;
  teacher: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  durationHours: number;
  maxStudents: number;
  currentStudents: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// User Management Service
export const userManagementService = {
  // Get all users
  async getAllUsers(): Promise<AdminUser[]> {
    const response = await api.get('/admin/users');
    return response.data;
  },

  // Get user statistics
  async getStats(): Promise<AdminStats> {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Toggle user status (activate/deactivate)
  async toggleUserStatus(userId: number): Promise<{ message: string }> {
    const response = await api.put(`/admin/users/${userId}/status`);
    return response.data;
  },

  // Delete user
  async deleteUser(userId: number): Promise<{ message: string }> {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Get users by role
  async getUsersByRole(role: 'STUDENT' | 'TEACHER' | 'ADMIN'): Promise<AdminUser[]> {
    const response = await api.get(`/admin/users/role/${role}`);
    return response.data;
  },

  // Update user information
  async updateUser(userId: number, userData: {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    role: 'STUDENT' | 'TEACHER' | 'ADMIN';
    isActive: boolean;
  }): Promise<AdminUser> {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  // Create new user
  async createUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    role: 'STUDENT' | 'TEACHER' | 'ADMIN';
    isActive: boolean;
  }): Promise<AdminUser> {
    const response = await api.post('/admin/users', userData);
    return response.data;
  }
};

// Course Management Service
export const courseManagementService = {
  // Get all courses (admin only)
  async getAllCourses(): Promise<AdminCourse[]> {
    const response = await api.get('/courses/all');
    return response.data;
  },

  // Delete/Archive course
  async deleteCourse(courseId: number): Promise<{ message: string }> {
    const response = await api.delete(`/courses/${courseId}`);
    return response.data;
  },

  // Search courses
  async searchCourses(keyword: string): Promise<AdminCourse[]> {
    const response = await api.get(`/courses/search?keyword=${encodeURIComponent(keyword)}`);
    return response.data;
  },

  // Get available courses
  async getAvailableCourses(): Promise<AdminCourse[]> {
    const response = await api.get('/courses/available');
    return response.data;
  }
};

// Reports Service (using existing endpoints where possible)
export const reportsService = {
  // Get platform analytics (combining user and course stats)
  async getPlatformAnalytics(): Promise<any> {
    // Since we don't have specific analytics endpoints, we'll use existing stats
    const [userStats] = await Promise.all([
      userManagementService.getStats()
    ]);
    
    return {
      revenue: 42580, // Mock data since no revenue endpoint exists
      newUsers: userStats.totalUsers,
      completions: 1243, // Mock data
      engagement: 74.2 // Mock data
    };
  },

  // Get user growth data (mock implementation)
  async getUserGrowth(): Promise<any[]> {
    // Mock data since no specific growth endpoint exists
    return [
      { period: 'Week 1', users: 120, courses: 8, enrollments: 340 },
      { period: 'Week 2', users: 145, courses: 12, enrollments: 456 },
      { period: 'Week 3', users: 167, courses: 15, enrollments: 523 },
      { period: 'Week 4', users: 189, courses: 18, enrollments: 634 }
    ];
  },

  // Get top courses (using available courses endpoint)
  async getTopCourses(limit: number = 5): Promise<any[]> {
    const courses = await courseManagementService.getAvailableCourses();
    // Transform and limit results
    return courses.slice(0, limit).map(course => ({
      title: course.title,
      enrollments: course.currentStudents,
      revenue: course.currentStudents * 49.99, // Mock calculation
      rating: 4.5 + Math.random() * 0.5 // Mock rating
    }));
  },

  // Get recent activity (mock implementation)
  async getRecentActivity(limit: number = 10): Promise<any[]> {
    // Mock data since no specific activity endpoint exists
    return [
      { type: 'enrollment', user: 'John Doe', course: 'React Fundamentals', time: '2 minutes ago' },
      { type: 'completion', user: 'Jane Smith', course: 'CSS Advanced', time: '15 minutes ago' },
      { type: 'review', user: 'Bob Wilson', course: 'JavaScript Basics', time: '1 hour ago' },
      { type: 'enrollment', user: 'Alice Brown', course: 'Python Basics', time: '2 hours ago' }
    ].slice(0, limit);
  },

  // Export report (mock implementation)
  async exportReport(type: string): Promise<Blob> {
    // Mock implementation - would normally call a backend endpoint
    const mockData = `${type.toUpperCase()} REPORT\n\nGenerated on: ${new Date().toISOString()}\n\nThis is a mock export.`;
    return new Blob([mockData], { type: 'text/plain' });
  }
};

// Settings Service (mock implementation since no settings endpoints exist)
export const settingsService = {
  // Get current settings
  async getSettings(): Promise<any> {
    // Mock implementation - would normally fetch from backend
    return {
      siteName: 'RevConseil Learning Platform',
      siteDescription: 'Professional e-learning platform for skill development',
      allowRegistration: true,
      requireEmailVerification: true,
      maintenanceMode: false
    };
  },

  // Update settings
  async updateSettings(settings: any): Promise<{ message: string }> {
    // Mock implementation - would normally send to backend
    console.log('Updating settings:', settings);
    return { message: 'Settings updated successfully' };
  },

  // Create backup
  async createBackup(): Promise<{ message: string }> {
    // Mock implementation
    return { message: 'Backup created successfully' };
  },

  // Download backup
  async downloadBackup(backupId: string): Promise<Blob> {
    // Mock implementation
    const mockData = `PLATFORM BACKUP\n\nBackup ID: ${backupId}\nCreated: ${new Date().toISOString()}`;
    return new Blob([mockData], { type: 'application/zip' });
  }
};
