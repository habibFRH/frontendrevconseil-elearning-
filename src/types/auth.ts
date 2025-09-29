export enum Role {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
}

// Course related types
export interface Course {
  id: number;
  title: string;
  description?: string;
  teacher: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  durationHours?: number;
  maxStudents?: number;
  currentStudents: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseRequest {
  title: string;
  description?: string;
  durationHours?: number;
  maxStudents?: number;
}

export interface CourseStats {
  totalCourses: number;
  activeCourses: number;
  totalStudents: number;
}

// Lesson and Content types
export enum ContentType {
  YOUTUBE_VIDEO = 'YOUTUBE_VIDEO',
  UPLOADED_VIDEO = 'UPLOADED_VIDEO',
  DOCUMENT = 'DOCUMENT',
  EXTERNAL_LINK = 'EXTERNAL_LINK',
  AUDIO = 'AUDIO',
  IMAGE = 'IMAGE'
}

export interface LessonContent {
  id: number;
  title: string;
  description?: string;
  contentType: ContentType;
  contentUrl: string;
  lessonId: number;
  lessonTitle: string;
  contentOrder: number;
  durationSeconds?: number;
  fileSizeMb?: number;
  thumbnailUrl?: string;
  isDownloadable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: number;
  title: string;
  description?: string;
  courseId: number;
  courseTitle: string;
  lessonOrder: number;
  durationMinutes?: number;
  isFree: boolean;
  isPublished: boolean;
  contents: LessonContent[];
  createdAt: string;
  updatedAt: string;
}

export interface LessonRequest {
  title: string;
  description?: string;
  lessonOrder?: number;
  durationMinutes?: number;
  isFree?: boolean;
  isPublished?: boolean;
}

export interface LessonContentRequest {
  title: string;
  description?: string;
  contentType: ContentType;
  contentUrl: string;
  contentOrder?: number;
  durationSeconds?: number;
  fileSizeMb?: number;
  thumbnailUrl?: string;
  isDownloadable?: boolean;
}

// Enrollment types
export enum EnrollmentStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  SUSPENDED = 'SUSPENDED',
  DROPPED = 'DROPPED'
}

export interface Enrollment {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  courseId: number;
  courseTitle: string;
  courseDescription?: string;
  teacherName: string;
  status: EnrollmentStatus;
  progressPercentage: number;
  enrolledAt: string;
  completedAt?: string;
  lastAccessedAt: string;
}

export interface EnrollmentRequest {
  courseId: number;
}

export interface EnrollmentStats {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  averageProgress: number;
}


