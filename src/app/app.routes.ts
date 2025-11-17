import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { adminGuard } from './core/guards/admin.guard';

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
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'verwaltung/inhaltverwaltung',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard, roleGuard],
  },
  {
    path: 'verwaltung/benutzerverwaltung',
    loadComponent: () =>
      import('./features/user-management/user-management.component').then(
        m => m.UserManagementComponent
      ),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'verwaltung/dashboard',
    loadComponent: () =>
      import('./features/admin-dashboard/admin-dashboard.component').then(
        m => m.AdminDashboardComponent
      ),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'verwaltung/inhaltverwaltung/course/create',
    loadComponent: () =>
      import('./features/dashboard/course-creator/course-creator.component').then(
        m => m.CourseCreatorComponent
      ),
    canActivate: [authGuard, roleGuard],
  },
  {
    path: 'verwaltung/inhaltverwaltung/course/:courseId/edit',
    loadComponent: () =>
      import('./features/dashboard/course-creator/course-creator.component').then(
        m => m.CourseCreatorComponent
      ),
    canActivate: [authGuard, roleGuard],
  },
  {
    path: 'verwaltung/inhaltverwaltung/course/:courseId/lesson/create',
    loadComponent: () =>
      import('./features/dashboard/lesson-creator/lesson-creator.component').then(
        m => m.LessonCreatorComponent
      ),
    canActivate: [authGuard, roleGuard],
  },
  {
    path: 'verwaltung/inhaltverwaltung/lesson/:id',
    loadComponent: () =>
      import('./features/dashboard/lesson-editor/lesson-editor.component').then(
        m => m.LessonEditorComponent
      ),
    canActivate: [authGuard, roleGuard],
  },
  // Legacy redirects for backward compatibility
  {
    path: 'dashboard',
    redirectTo: 'verwaltung/inhaltverwaltung',
    pathMatch: 'full',
  },
  {
    path: 'dashboard/user-management',
    redirectTo: 'verwaltung/benutzerverwaltung',
    pathMatch: 'full',
  },
  {
    path: 'dashboard/course/create',
    redirectTo: 'verwaltung/inhaltverwaltung/course/create',
    pathMatch: 'full',
  },
  {
    path: 'dashboard/course/:courseId/lesson/create',
    redirectTo: 'verwaltung/inhaltverwaltung/course/:courseId/lesson/create',
    pathMatch: 'full',
  },
  {
    path: 'dashboard/lesson/:id',
    redirectTo: 'verwaltung/inhaltverwaltung/lesson/:id',
    pathMatch: 'full',
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
