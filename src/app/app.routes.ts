import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'courses',
    loadComponent: () =>
      import('./features/courses/courses/courses.component').then(m => m.CoursesComponent),
  },
  {
    path: 'courses/:id',
    loadComponent: () =>
      import('./features/courses/course-detail/course-detail.component').then(
        m => m.CourseDetailComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
