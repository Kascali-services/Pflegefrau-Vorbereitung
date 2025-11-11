import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-course-celebration',
  imports: [CommonModule],
  templateUrl: './course-celebration.component.html',
  styleUrl: './course-celebration.component.scss',
})
export class CourseCelebrationComponent {
  @Input() courseTitle = '';
  @Input() completedLessons = 0;
  @Input() totalLessons = 0;
  @Output() continue = new EventEmitter<void>();

  onContinue(): void {
    this.continue.emit();
  }
}
