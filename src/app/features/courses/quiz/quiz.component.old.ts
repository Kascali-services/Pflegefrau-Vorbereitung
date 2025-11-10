import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { Quiz, Question } from '../../../models/course.model';
import { QuizScore } from '../../../models/progress.model';

interface QuizAnswer {
  questionId: string;
  selectedAnswer: number | null;
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
  lessonId: string | undefined;
  currentQuestionIndex = 0;
  answers: QuizAnswer[] = [];
  isSubmitted = false;
  score = 0;
  passed = false;
  attempts = 1;
  showExplanation = false;
  alreadyPassed = false;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const quizId = params['quizId'];
      if (quizId) {
        this.checkIfQuizPassed(quizId);
        this.loadQuiz(quizId);
      }
    });

    this.route.queryParams.subscribe(params => {
      this.lessonId = params['lessonId'];
    });
  }

  private checkIfQuizPassed(quizId: string): void {
    this.courseService.isQuizPassed(quizId).subscribe(isPassed => {
      this.alreadyPassed = isPassed;
    });
  }

  private loadQuiz(quizId: string): void {
    this.courseService.getQuizById(quizId).subscribe(quiz => {
      this.quiz = quiz;
      if (quiz) {
        this.initializeAnswers(quiz.questions);
        this.loadPreviousAttempts(quizId);
      }
    });
  }

  private initializeAnswers(questions: Question[]): void {
    this.answers = questions.map(q => ({
      questionId: q.id,
      selectedAnswer: null,
      isCorrect: null,
    }));
  }

  private loadPreviousAttempts(quizId: string): void {
    this.courseService.getUserProgress().subscribe(progress => {
      const previousScore = progress.quizScores.find(qs => qs.quizId === quizId);
      if (previousScore) {
        this.attempts = previousScore.attempts + 1;
      }
    });
  }

  get currentQuestion(): Question | undefined {
    return this.quiz?.questions[this.currentQuestionIndex];
  }

  get currentAnswer(): QuizAnswer | undefined {
    return this.answers[this.currentQuestionIndex];
  }

  get progress(): number {
    if (!this.quiz) return 0;
    return ((this.currentQuestionIndex + 1) / this.quiz.questions.length) * 100;
  }

  selectAnswer(answerIndex: number): void {
    if (this.currentAnswer && !this.isSubmitted) {
      this.currentAnswer.selectedAnswer = answerIndex;
    }
  }

  nextQuestion(): void {
    if (this.quiz && this.currentQuestionIndex < this.quiz.questions.length - 1) {
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

  canSubmit(): boolean {
    return this.answers.every(a => a.selectedAnswer !== null) && !this.isSubmitted;
  }

  submitQuiz(): void {
    if (!this.quiz || !this.canSubmit()) return;

    // Calculate score
    let correct = 0;
    this.quiz.questions.forEach((question, index) => {
      const answer = this.answers[index];
      const isCorrect = answer.selectedAnswer === question.correctAnswer;
      answer.isCorrect = isCorrect;
      if (isCorrect) correct++;
    });

    this.score = Math.round((correct / this.quiz.questions.length) * 100);
    this.passed = this.score >= this.quiz.passingScore;
    this.isSubmitted = true;
    this.showExplanation = true;

    // Save quiz score
    const quizScore: QuizScore = {
      quizId: this.quiz.id,
      score: this.score,
      attempts: this.attempts,
      lastAttempt: new Date(),
      passed: this.passed,
    };

    this.courseService.saveQuizScore(quizScore).subscribe();

    // Mark lesson as completed if passed
    if (this.passed && this.lessonId) {
      this.courseService.markLessonCompleted(this.lessonId).subscribe();
    }
  }

  retryQuiz(): void {
    this.currentQuestionIndex = 0;
    this.initializeAnswers(this.quiz!.questions);
    this.isSubmitted = false;
    this.showExplanation = false;
    this.attempts++;
  }

  continueToNextLesson(): void {
    if (this.lessonId) {
      this.courseService.getNextLesson(this.lessonId).subscribe(nextLesson => {
        if (nextLesson) {
          this.router.navigate(['/courses/lesson', nextLesson.id]);
        } else {
          // No next lesson, go back to course
          this.courseService.getLessonById(this.lessonId!).subscribe(lesson => {
            if (lesson) {
              this.courseService.getChapterById(lesson.chapterId).subscribe(chapter => {
                if (chapter) {
                  this.router.navigate(['/courses', chapter.moduleId]);
                }
              });
            }
          });
        }
      });
    }
  }

  goBackToCourse(): void {
    if (this.lessonId) {
      this.courseService.getLessonById(this.lessonId).subscribe(lesson => {
        if (lesson) {
          this.courseService.getChapterById(lesson.chapterId).subscribe(chapter => {
            if (chapter) {
              this.router.navigate(['/courses', chapter.moduleId]);
            }
          });
        }
      });
    } else {
      this.router.navigate(['/courses']);
    }
  }
}
