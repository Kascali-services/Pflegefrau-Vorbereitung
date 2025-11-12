import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'auth/reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password.component').then(
        m => m.ResetPasswordComponent
      ),
  },
  {
    path: 'courses',
    loadComponent: () =>
      import('./features/courses/courses/courses.component').then(m => m.CoursesComponent),
  },
  {
    path: 'my-courses',
    loadComponent: () =>
      import('./features/my-courses/my-courses.component').then(m => m.MyCoursesComponent),
    canActivate: [authGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard, roleGuard],
  },
  {
    path: 'dashboard/course/create',
    loadComponent: () =>
      import('./features/dashboard/course-creator/course-creator.component').then(
        m => m.CourseCreatorComponent
      ),
    canActivate: [authGuard, roleGuard],
  },
  {
    path: 'dashboard/course/:courseId/lesson/create',
    loadComponent: () =>
      import('./features/dashboard/lesson-creator/lesson-creator.component').then(
        m => m.LessonCreatorComponent
      ),
    canActivate: [authGuard, roleGuard],
  },
  {
    path: 'dashboard/lesson/:id',
    loadComponent: () =>
      import('./features/dashboard/lesson-editor/lesson-editor.component').then(
        m => m.LessonEditorComponent
      ),
    canActivate: [authGuard, roleGuard],
  },
  {
    path: 'courses/:id',
    loadComponent: () =>
      import('./features/courses/course-detail/course-detail.component').then(
        m => m.CourseDetailComponent
      ),
  },
  {
    path: 'courses/lesson/:lessonId',
    loadComponent: () =>
      import('./features/courses/course-progression/course-progression.component').then(
        m => m.CourseProgressionComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'courses/quiz/:quizId',
    loadComponent: () =>
      import('./features/courses/quiz/quiz.component').then(m => m.QuizComponent),
    canActivate: [authGuard],
  },
  {
    path: 'courses/completion/:courseId',
    loadComponent: () =>
      import('./features/courses/course-completion/course-completion.component').then(
        m => m.CourseCompletionComponent
      ),
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./features/contact/contact.component').then(m => m.ContactComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
