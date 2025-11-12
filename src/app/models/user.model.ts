/**
 * User interface - Represents a user in the system
 * Maps to: users table in database
 */
export interface User {
  id: string; // INT [PK]
  email: string; // VARCHAR(255) UNIQUE NOT NULL
  username?: string; // VARCHAR(100) UNIQUE NOT NULL - optional for backward compatibility during migration
  passwordHash?: string; // VARCHAR(255) NOT NULL - not exposed in frontend
  firstName?: string; // VARCHAR(100)
  lastName?: string; // VARCHAR(100)
  role?: 'student' | 'instructor' | 'admin'; // ENUM('student', 'instructor', 'admin') DEFAULT 'student'
  isActive?: boolean; // BOOLEAN NOT NULL DEFAULT TRUE
  avatarUrl?: string; // VARCHAR(500) - not in DB schema but useful for frontend
  createdAt?: Date; // DATETIME DEFAULT CURRENT_TIMESTAMP
  updatedAt?: Date; // DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  lastLoginAt?: Date; // DATETIME
}

/**
 * UserCourseEnrollment interface - Tracks user enrollment in courses
 * Maps to: user_course_enrollments table in database
 */
export interface UserCourseEnrollment {
  id: string; // INT [PK]
  userId: string; // INT [FK → users.id] NOT NULL
  courseId: string; // INT [FK → courses.id] NOT NULL
  enrolledAt?: Date; // DATETIME DEFAULT CURRENT_TIMESTAMP
  lastAccessedAt?: Date; // DATETIME
  completedAt?: Date; // DATETIME - when course was completed
}
