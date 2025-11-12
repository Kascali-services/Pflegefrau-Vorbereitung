/**
 * User interface - Represents a user in the system
 * Maps to: User table in database
 */
export interface User {
  id: string; // VARCHAR(50) [PK]
  email: string; // VARCHAR(255) UNIQUE NOT NULL
  passwordHash?: string; // VARCHAR(255) NOT NULL - not exposed in frontend
  firstName?: string; // VARCHAR(100)
  lastName?: string; // VARCHAR(100)
  avatarUrl?: string; // VARCHAR(500)
  role?: 'student' | 'content_manager' | 'admin'; // ENUM - User role in the system
  aktenzeichen?: string; // VARCHAR(8) - Recommendation number (Empfehlungsnummer) for users coming via recommendation
  createdAt?: Date; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  updatedAt?: Date; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  lastLoginAt?: Date; // TIMESTAMP
}

/**
 * UserCourseEnrollment interface - Tracks user enrollment in courses
 * Maps to: UserCourseEnrollment table in database
 */
export interface UserCourseEnrollment {
  id: string; // VARCHAR(50) [PK]
  userId: string; // VARCHAR(50) [FK → User.id] NOT NULL
  courseId: string; // VARCHAR(50) [FK → Course.id] NOT NULL
  enrolledAt?: Date; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  lastAccessedAt?: Date; // TIMESTAMP
}
