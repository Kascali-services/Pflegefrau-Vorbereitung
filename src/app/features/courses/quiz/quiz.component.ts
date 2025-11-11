import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { Quiz, Question, QuizOption, Lesson } from '../../../models/course.model';

interface QuizQuestionWithOptions {
  question: Question;
  options: QuizOption[];
  selectedOptionIds: string[];
  isAnswered: boolean;
  isCorrect: boolean | null;
}

@Component({
  selector: 'app-quiz',
  imports: [CommonModule],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.scss',
})
export class QuizComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courseService = inject(CourseService);

  quiz: Quiz | undefined;
  lesson: Lesson | undefined;
  lessonId: string | undefined;
  questions: QuizQuestionWithOptions[] = [];
  currentQuestionIndex = 0;
  isSubmitted = false;
  score = 0;
  passed = false;
  attempts = 1;
  showExplanation = false;
  alreadyPassed = false;
  timeRemaining: number | null = null;
  timerInterval: any;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const quizId = params['quizId'];
      if (quizId) {
        this.loadQuiz(quizId);
      }
    });

    this.route.queryParams.subscribe(params => {
      this.lessonId = params['lessonId'];
      if (this.lessonId) {
        this.courseService.getLessonById(this.lessonId).subscribe(lesson => {
          this.lesson = lesson;
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  private loadQuiz(quizId: string): void {
    this.courseService.getQuizById(quizId).subscribe(quiz => {
      this.quiz = quiz;
      if (quiz) {
        // Check if user already passed
        if (quiz.lessonId) {
          this.courseService.getLessonProgress(quiz.lessonId).subscribe(progress => {
            this.alreadyPassed = progress?.isCompleted || false;
            this.attempts = progress?.attemptCount || 0;
          });
        }

        // Load questions with their options
        this.courseService.getQuestionsByQuizId(quizId).subscribe(questions => {
          // Load options for each question
          const questionPromises = questions.map(question => {
            return new Promise<QuizQuestionWithOptions>((resolve) => {
              this.courseService.getOptionsByQuestionId(question.id).subscribe(options => {
                resolve({
                  question,
                  options,
                  selectedOptionIds: [],
                  isAnswered: false,
                  isCorrect: null,
                });
              });
            });
          });

          Promise.all(questionPromises).then(questionsWithOptions => {
            this.questions = questionsWithOptions;
          });
        });

        // Start timer if time limit exists
        if (quiz.timeLimitMinutes) {
          this.timeRemaining = quiz.timeLimitMinutes * 60; // Convert to seconds
          this.startTimer();
        }
      }
    });
  }

  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (this.timeRemaining !== null && this.timeRemaining > 0) {
        this.timeRemaining--;
      } else if (this.timeRemaining === 0) {
        this.submitQuiz(); // Auto-submit when time runs out
      }
    }, 1000);
  }

  get currentQuestion(): QuizQuestionWithOptions | undefined {
    return this.questions[this.currentQuestionIndex];
  }

  get progress(): number {
    if (this.questions.length === 0) return 0;
    return (this.currentQuestionIndex + 1) / this.questions.length * 100;
  }

  get answeredCount(): number {
    return this.questions.filter(q => q.isAnswered).length;
  }

  selectOption(optionId: string): void {
    if (!this.currentQuestion || this.isSubmitted) return;

    const question = this.currentQuestion.question;

    if (question.type === 'qcm' || question.type === 'vrai_faux') {
      // Single choice - replace selection
      this.currentQuestion.selectedOptionIds = [optionId];
      this.currentQuestion.isAnswered = true;
    } else if (question.type === 'qcm_multiple') {
      // Multiple choice - toggle selection
      const index = this.currentQuestion.selectedOptionIds.indexOf(optionId);
      if (index > -1) {
        this.currentQuestion.selectedOptionIds.splice(index, 1);
      } else {
        this.currentQuestion.selectedOptionIds.push(optionId);
      }
      this.currentQuestion.isAnswered = this.currentQuestion.selectedOptionIds.length > 0;
    }
  }

  isOptionSelected(optionId: string): boolean {
    return this.currentQuestion?.selectedOptionIds.includes(optionId) || false;
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.showExplanation = false;
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.showExplanation = false;
    }
  }

  goToQuestion(index: number): void {
    this.currentQuestionIndex = index;
    this.showExplanation = false;
  }

  canSubmit(): boolean {
    return this.questions.every(q => q.isAnswered) && !this.isSubmitted;
  }

  submitQuiz(): void {
    if (!this.quiz || !this.lessonId) return;

    // Stop timer
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    // Prepare answers for submission
    const answers = this.questions.map(q => ({
      questionId: q.question.id,
      selectedOptionIds: q.selectedOptionIds,
    }));

    // Submit quiz
    this.courseService.submitQuizAttempt(this.quiz.id, this.lessonId, answers).subscribe(attempt => {
      this.isSubmitted = true;
      this.score = attempt.score;
      this.passed = attempt.passed;
      this.attempts = attempt.attemptNumber;

      // Mark each question as correct/incorrect
      this.questions.forEach(q => {
        const answer = attempt.answers.find(a => a.questionId === q.question.id);
        q.isCorrect = answer?.isCorrect || false;
      });

      // Show explanation for current question
      this.showExplanation = true;
    });
  }

  retryQuiz(): void {
    // Reset quiz state
    this.questions.forEach(q => {
      q.selectedOptionIds = [];
      q.isAnswered = false;
      q.isCorrect = null;
    });
    this.currentQuestionIndex = 0;
    this.isSubmitted = false;
    this.score = 0;
    this.passed = false;
    this.showExplanation = false;

    // Restart timer if applicable
    if (this.quiz?.timeLimitMinutes) {
      this.timeRemaining = this.quiz.timeLimitMinutes * 60;
      this.startTimer();
    }
  }

  goToLesson(): void {
    if (this.lessonId) {
      this.router.navigate(['/courses/lesson', this.lessonId]);
    } else if (this.lesson) {
      this.router.navigate(['/courses', this.lesson.courseId]);
    } else {
      this.router.navigate(['/courses']);
    }
  }

  continueToNextLesson(): void {
    if (!this.lessonId) {
      this.goToLesson();
      return;
    }

    this.courseService.getNextLesson(this.lessonId).subscribe(nextLesson => {
      if (nextLesson) {
        this.router.navigate(['/courses/lesson', nextLesson.id]);
      } else if (this.lesson) {
        // No next lesson - course completed, go to completion celebration
        this.router.navigate(['/courses/completion', this.lesson.courseId]);
      } else {
        this.router.navigate(['/courses']);
      }
    });
  }

  getTimerDisplay(): string {
    if (this.timeRemaining === null) return '';
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  getTimerClass(): string {
    if (this.timeRemaining === null) return '';
    if (this.timeRemaining < 60) return 'timer-critical';
    if (this.timeRemaining < 300) return 'timer-warning';
    return '';
  }

  getQuestionTypeLabel(type: string): string {
    switch (type) {
      case 'qcm':
        return 'Choix unique';
      case 'vrai_faux':
        return 'Vrai ou Faux';
      case 'qcm_multiple':
        return 'Choix multiples';
      default:
        return type;
    }
  }
}
