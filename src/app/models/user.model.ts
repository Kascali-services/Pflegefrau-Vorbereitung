/**
 * User interface - Represents a user in the system
 */
export interface User {
  id: string;
  name: string;
  email: string;
}

/**
 * UserCourseEnrollment interface - Tracks user enrollment in courses
 */
export interface UserCourseEnrollment {
  userId: string;
  moduleId: string;
  startDate: Date;
  lastAccessedDate: Date;
}
