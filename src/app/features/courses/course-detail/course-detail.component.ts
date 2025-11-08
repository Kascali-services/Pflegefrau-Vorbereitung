import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

interface Course {
  id: number;
  title: string;
  description: string;
  level: string;
  duration: string;
}

@Component({
  selector: 'app-course-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.scss',
})
export class CourseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  course: Course | undefined;

  // Mock data - will be replaced with API calls later
  private courses: Course[] = [
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

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.course = this.courses.find(c => c.id === id);
    });
  }
}
