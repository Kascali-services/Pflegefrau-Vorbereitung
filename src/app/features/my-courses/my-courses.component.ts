import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CourseService } from '../../core/services/course.service';
import { UserService } from '../../core/services/user.service';
import { Module } from '../../models/course.model';
import { UserCourseEnrollment, User } from '../../models/user.model';

interface EnrolledCourse {
  module: Module;
  enrollment: UserCourseEnrollment;
  progressPercentage: number;
  completedChapters: number;
  totalChapters: number;
}

@Component({
  selector: 'app-my-courses',
  imports: [CommonModule, RouterLink],
  templateUrl: './my-courses.component.html',
  styleUrl: './my-courses.component.scss',
})
export class MyCoursesComponent implements OnInit {
  private courseService = inject(CourseService);
  private userService = inject(UserService);
  
  enrolledCourses: EnrolledCourse[] = [];
  currentUser: User | null = null;
  isLoading = true;

  ngOnInit(): void {
    // Get current user
    this.userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });

    // Get enrolled courses with progress
    this.courseService.getUserEnrolledCourses().subscribe(courses => {
      this.enrolledCourses = courses;
      this.isLoading = false;
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getProgressBarColor(percentage: number): string {
    if (percentage < 30) return '#f44336'; // Red
    if (percentage < 70) return '#ff9800'; // Orange
    return '#4caf50'; // Green
  }

  getCompletionStatus(percentage: number): string {
    if (percentage === 0) return 'Non commencé';
    if (percentage === 100) return 'Terminé';
    return 'En cours';
  }
}
