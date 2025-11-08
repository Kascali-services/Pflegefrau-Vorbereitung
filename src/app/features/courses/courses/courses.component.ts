import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Course {
  id: number;
  title: string;
  description: string;
  level: string;
  duration: string;
}

@Component({
  selector: 'app-courses',
  imports: [CommonModule, RouterLink],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss',
})
export class CoursesComponent {
  courses: Course[] = [
    {
      id: 1,
      title: 'Grundlagen der Pflege',
      description: 'Einführung in die Grundlagen der professionellen Pflege und Betreuung',
      level: 'Anfänger',
      duration: '4 Wochen',
    },
    {
      id: 2,
      title: 'Medizinische Terminologie',
      description: 'Lernen Sie die wichtigsten medizinischen Fachbegriffe und deren Bedeutung',
      level: 'Anfänger',
      duration: '3 Wochen',
    },
    {
      id: 3,
      title: 'Anatomie und Physiologie',
      description: 'Verstehen Sie den menschlichen Körper und seine Funktionen',
      level: 'Fortgeschritten',
      duration: '6 Wochen',
    },
    {
      id: 4,
      title: 'Hygiene und Infektionsprävention',
      description: 'Wichtige Hygienestandards und Maßnahmen zur Infektionsprävention',
      level: 'Anfänger',
      duration: '2 Wochen',
    },
  ];
}
