import { Injectable, inject } from '@angular/core';
import { Observable, of, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Module, Chapter, Lesson, Quiz } from '../../models/course.model';
import { UserProgress, QuizScore } from '../../models/progress.model';
import { UserCourseEnrollment } from '../../models/user.model';
import { UserService } from './user.service';

/**
 * CourseService - Manages course data and user progress
 * Currently uses in-memory data; can be extended to use HTTP API
 */
@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private userService = inject(UserService);
  
  private modulesSubject = new BehaviorSubject<Module[]>([]);
  private quizzesSubject = new BehaviorSubject<Quiz[]>([]);
  private progressSubject = new BehaviorSubject<UserProgress>({
    completedLessons: [],
    quizScores: [],
    totalProgress: 0,
    moduleProgress: [],
  });
  private enrollmentsSubject = new BehaviorSubject<UserCourseEnrollment[]>([]);

  modules$ = this.modulesSubject.asObservable();
  quizzes$ = this.quizzesSubject.asObservable();
  progress$ = this.progressSubject.asObservable();
  enrollments$ = this.enrollmentsSubject.asObservable();

  constructor() {
    this.initializeMockData();
  }

  /**
   * Get all modules
   */
  getAllModules(): Observable<Module[]> {
    return this.modules$;
  }

  /**
   * Get a specific module by ID
   */
  getModuleById(moduleId: string): Observable<Module | undefined> {
    return this.modules$.pipe(map(modules => modules.find(m => m.id === moduleId)));
  }

  /**
   * Get all chapters for a specific module
   */
  getChaptersByModuleId(moduleId: string): Observable<Chapter[]> {
    return this.modules$.pipe(
      map(modules => {
        const module = modules.find(m => m.id === moduleId);
        return module?.chapters || [];
      })
    );
  }

  /**
   * Get a specific chapter by ID
   */
  getChapterById(chapterId: string): Observable<Chapter | undefined> {
    return this.modules$.pipe(
      map(modules => {
        for (const module of modules) {
          const chapter = module.chapters.find(c => c.id === chapterId);
          if (chapter) return chapter;
        }
        return undefined;
      })
    );
  }

  /**
   * Get all lessons for a specific chapter
   */
  getLessonsByChapterId(chapterId: string): Observable<Lesson[]> {
    return this.getChapterById(chapterId).pipe(map(chapter => chapter?.lessons || []));
  }

  /**
   * Get a specific lesson by ID
   */
  getLessonById(lessonId: string): Observable<Lesson | undefined> {
    return this.modules$.pipe(
      map(modules => {
        for (const module of modules) {
          for (const chapter of module.chapters) {
            const lesson = chapter.lessons.find(l => l.id === lessonId);
            if (lesson) return lesson;
          }
        }
        return undefined;
      })
    );
  }

  /**
   * Get a quiz by ID
   */
  getQuizById(quizId: string): Observable<Quiz | undefined> {
    return this.quizzes$.pipe(map(quizzes => quizzes.find(q => q.id === quizId)));
  }

  /**
   * Get user progress
   */
  getUserProgress(): Observable<UserProgress> {
    return this.progress$;
  }

  /**
   * Check if a lesson is accessible based on prerequisites
   */
  isLessonAccessible(lessonId: string): Observable<boolean> {
    return this.modules$.pipe(
      map(modules => {
        const progress = this.progressSubject.value;
        
        // Find the lesson and its chapter
        for (const module of modules) {
          for (const chapter of module.chapters) {
            const lessonIndex = chapter.lessons.findIndex(l => l.id === lessonId);
            if (lessonIndex !== -1) {
              // First lesson is always accessible
              if (lessonIndex === 0 && chapter.order === 1) {
                return true;
              }
              
              // Check if previous lesson is completed
              if (lessonIndex > 0) {
                const previousLesson = chapter.lessons[lessonIndex - 1];
                const isPreviousCompleted = progress.completedLessons.includes(previousLesson.id);
                
                // If previous lesson had a quiz, check if it was passed
                if (previousLesson.quizId) {
                  const quizScore = progress.quizScores.find(qs => qs.quizId === previousLesson.quizId);
                  return isPreviousCompleted && (quizScore?.passed || false);
                }
                
                return isPreviousCompleted;
              }
              
              // Check if previous chapter's last lesson is completed
              const prevChapter = module.chapters.find(c => c.order === chapter.order - 1);
              if (prevChapter) {
                const lastLesson = prevChapter.lessons[prevChapter.lessons.length - 1];
                const isLastLessonCompleted = progress.completedLessons.includes(lastLesson.id);
                
                // Check quiz if exists
                if (lastLesson.quizId) {
                  const quizScore = progress.quizScores.find(qs => qs.quizId === lastLesson.quizId);
                  return isLastLessonCompleted && (quizScore?.passed || false);
                }
                
                return isLastLessonCompleted;
              }
              
              return false;
            }
          }
        }
        return false;
      })
    );
  }

  /**
   * Get the next lesson after completing current one
   */
  getNextLesson(currentLessonId: string): Observable<Lesson | undefined> {
    return this.modules$.pipe(
      map(modules => {
        for (const module of modules) {
          for (const chapter of module.chapters) {
            const currentIndex = chapter.lessons.findIndex(l => l.id === currentLessonId);
            
            if (currentIndex !== -1) {
              // Check if there's a next lesson in current chapter
              if (currentIndex < chapter.lessons.length - 1) {
                return chapter.lessons[currentIndex + 1];
              }
              
              // Look for first lesson of next chapter
              const nextChapter = module.chapters.find(c => c.order === chapter.order + 1);
              if (nextChapter && nextChapter.lessons.length > 0) {
                return nextChapter.lessons[0];
              }
            }
          }
        }
        return undefined;
      })
    );
  }

  /**
   * Get user's enrolled courses with progress information
   */
  getUserEnrolledCourses(): Observable<{
    module: Module;
    enrollment: UserCourseEnrollment;
    progressPercentage: number;
    completedChapters: number;
    totalChapters: number;
  }[]> {
    return combineLatest([
      this.modules$,
      this.enrollments$,
      this.progress$
    ]).pipe(
      map(([modules, enrollments, progress]) => {
        return enrollments.map(enrollment => {
          const module = modules.find(m => m.id === enrollment.moduleId);
          if (!module) {
            return null;
          }

          const moduleProgress = progress.moduleProgress.find(
            mp => mp.moduleId === enrollment.moduleId
          );

          return {
            module,
            enrollment,
            progressPercentage: moduleProgress?.progress || 0,
            completedChapters: moduleProgress?.completedChapters || 0,
            totalChapters: module.chapters.length,
          };
        }).filter(item => item !== null) as {
          module: Module;
          enrollment: UserCourseEnrollment;
          progressPercentage: number;
          completedChapters: number;
          totalChapters: number;
        }[];
      })
    );
  }

  /**
   * Enroll user in a course
   */
  enrollUserInCourse(moduleId: string): Observable<void> {
    return this.userService.getCurrentUser().pipe(
      map(user => {
        if (!user) return;

        const enrollments = this.enrollmentsSubject.value;
        const existingEnrollment = enrollments.find(
          e => e.userId === user.id && e.moduleId === moduleId
        );

        if (!existingEnrollment) {
          const newEnrollment: UserCourseEnrollment = {
            userId: user.id,
            moduleId,
            startDate: new Date(),
            lastAccessedDate: new Date(),
          };
          enrollments.push(newEnrollment);
          this.enrollmentsSubject.next(enrollments);
        }
      })
    );
  }

  /**
   * Update last accessed date for a course
   */
  updateCourseLastAccessed(moduleId: string): Observable<void> {
    return this.userService.getCurrentUser().pipe(
      map(user => {
        if (!user) return;

        const enrollments = this.enrollmentsSubject.value;
        const enrollment = enrollments.find(
          e => e.userId === user.id && e.moduleId === moduleId
        );

        if (enrollment) {
          enrollment.lastAccessedDate = new Date();
          this.enrollmentsSubject.next([...enrollments]);
        }
      })
    );
  }

  /**
   * Mark a lesson as completed
   */
  markLessonCompleted(lessonId: string): Observable<void> {
    const currentProgress = this.progressSubject.value;
    if (!currentProgress.completedLessons.includes(lessonId)) {
      currentProgress.completedLessons.push(lessonId);
      this.updateProgress(currentProgress);
    }
    return of(void 0);
  }

  /**
   * Save quiz score
   */
  saveQuizScore(quizScore: QuizScore): Observable<void> {
    const currentProgress = this.progressSubject.value;
    const existingIndex = currentProgress.quizScores.findIndex(
      qs => qs.quizId === quizScore.quizId
    );

    if (existingIndex >= 0) {
      currentProgress.quizScores[existingIndex] = quizScore;
    } else {
      currentProgress.quizScores.push(quizScore);
    }

    this.updateProgress(currentProgress);
    return of(void 0);
  }

  /**
   * Update last accessed lesson
   */
  updateLastAccessedLesson(lessonId: string): Observable<void> {
    const currentProgress = this.progressSubject.value;
    currentProgress.lastAccessedLesson = lessonId;
    this.progressSubject.next(currentProgress);
    return of(void 0);
  }

  /**
   * Calculate and update overall progress
   */
  private updateProgress(progress: UserProgress): void {
    const modules = this.modulesSubject.value;
    const totalLessons = modules.reduce(
      (acc, module) =>
        acc +
        module.chapters.reduce((chapterAcc, chapter) => chapterAcc + chapter.lessons.length, 0),
      0
    );

    progress.totalProgress = totalLessons
      ? (progress.completedLessons.length / totalLessons) * 100
      : 0;

    // Update module progress
    progress.moduleProgress = modules.map(module => {
      const moduleLessons = module.chapters.reduce(
        (acc, chapter) => acc.concat(chapter.lessons.map(lesson => lesson.id)),
        [] as string[]
      );
      const completedInModule = moduleLessons.filter(lessonId =>
        progress.completedLessons.includes(lessonId)
      ).length;
      const completedChapters = module.chapters.filter(chapter =>
        chapter.lessons.every(lesson => progress.completedLessons.includes(lesson.id))
      ).length;

      return {
        moduleId: module.id,
        progress: moduleLessons.length ? (completedInModule / moduleLessons.length) * 100 : 0,
        completedChapters,
      };
    });

    this.progressSubject.next(progress);
  }

  /**
   * Initialize mock data for development
   */
  private initializeMockData(): void {
    const mockModules: Module[] = [
      {
        id: 'module-1',
        title: 'Vocabulaire anatomique',
        description: 'Apprenez les termes anatomiques essentiels',
        level: 'beginner',
        icon: 'school',
        chapters: [
          {
            id: 'chapter-1',
            moduleId: 'module-1',
            title: "Introduction à l'anatomie",
            lessons: [
              {
                id: 'lesson-1',
                chapterId: 'chapter-1',
                title: "Les bases de l'anatomie",
                content: `# Les bases de l'anatomie

L'anatomie est l'étude scientifique de la structure du corps humain et de ses différentes parties. C'est une discipline fondamentale pour tous les professionnels de la santé.

## Qu'est-ce que l'anatomie?

L'anatomie humaine est une branche de la biologie qui examine:
- La structure des organes
- Les systèmes corporels
- Les tissus et cellules
- Les relations entre différentes parties du corps

## Importance pour les soins infirmiers

Comprendre l'anatomie est essentiel pour:
1. Administrer correctement les soins
2. Communiquer avec les professionnels de santé
3. Reconnaître les anomalies
4. Comprendre les pathologies

## Niveaux d'organisation

Le corps humain s'organise en plusieurs niveaux:
- **Cellulaire**: Les cellules sont les unités de base
- **Tissulaire**: Les tissus sont des groupes de cellules similaires
- **Organique**: Les organes sont composés de plusieurs tissus
- **Systémique**: Les systèmes regroupent plusieurs organes`,
                type: 'text',
                duration: 15,
                order: 1,
                imageUrl: 'https://example.com/anatomy-basics.jpg',
              },
              {
                id: 'lesson-2',
                chapterId: 'chapter-1',
                title: 'Terminologie anatomique',
                content: `# Terminologie anatomique

La terminologie anatomique utilise des termes spécifiques pour décrire précisément les positions et structures du corps humain.

## Position anatomique standard

La position anatomique de référence est:
- Debout, face à l'observateur
- Bras le long du corps
- Paumes tournées vers l'avant
- Pieds légèrement écartés

## Plans de coupe

### Plan sagittal
Divise le corps en parties droite et gauche.

### Plan frontal (coronal)
Divise le corps en parties antérieure et postérieure.

### Plan transversal (horizontal)
Divise le corps en parties supérieure et inférieure.

## Termes de position

- **Antérieur/Ventral**: Vers l'avant
- **Postérieur/Dorsal**: Vers l'arrière
- **Supérieur/Crânial**: Vers le haut
- **Inférieur/Caudal**: Vers le bas
- **Médial**: Vers le milieu
- **Latéral**: Vers le côté
- **Proximal**: Près du point d'attache
- **Distal**: Loin du point d'attache

## Application pratique

Ces termes sont utilisés quotidiennement pour:
- Documenter les observations
- Communiquer avec l'équipe médicale
- Localiser les symptômes
- Décrire les procédures`,
                type: 'text',
                quizId: 'quiz-1',
                duration: 20,
                order: 2,
                imageUrl: 'https://example.com/anatomical-terminology.jpg',
              },
            ],
            estimatedTime: 35,
            order: 1,
          },
          {
            id: 'chapter-2',
            moduleId: 'module-1',
            title: 'Systèmes corporels',
            lessons: [
              {
                id: 'lesson-3',
                chapterId: 'chapter-2',
                title: 'Le système squelettique',
                content: `# Le système squelettique

Le système squelettique comprend tous les os du corps humain et joue un rôle crucial dans notre fonctionnement.

## Composition du squelette

Le squelette adulte comprend **206 os** divisés en deux parties:

### Squelette axial (80 os)
- Crâne: 22 os
- Colonne vertébrale: 26 os (vertèbres et os sacrés)
- Cage thoracique: 25 os (côtes et sternum)
- Os hyoïde: 1 os

### Squelette appendiculaire (126 os)
- Ceinture scapulaire: 4 os (clavicules et omoplates)
- Membres supérieurs: 60 os
- Ceinture pelvienne: 2 os (os coxaux)
- Membres inférieurs: 60 os

## Fonctions du système squelettique

1. **Support**: Maintient la structure du corps
2. **Protection**: Protège les organes vitaux
3. **Mouvement**: Sert de point d'ancrage aux muscles
4. **Production**: Fabrique les cellules sanguines (moelle osseuse)
5. **Stockage**: Réserve de minéraux (calcium, phosphore)

## Types d'os

- **Os longs**: Fémur, humérus (leviers pour le mouvement)
- **Os courts**: Carpiens, tarsiens (stabilité)
- **Os plats**: Crâne, côtes (protection)
- **Os irréguliers**: Vertèbres (fonctions spécialisées)

## Importance clinique

La connaissance du système squelettique permet de:
- Comprendre les fractures
- Identifier les déformations
- Assister dans les mobilisations
- Reconnaître les pathologies osseuses`,
                type: 'text',
                quizId: 'quiz-2',
                duration: 25,
                order: 1,
                imageUrl: 'https://example.com/skeletal-system.jpg',
              },
            ],
            estimatedTime: 25,
            order: 2,
          },
        ],
        createdAt: new Date('2025-01-01'),
      },
      {
        id: 'module-2',
        title: 'Soins infirmiers de base',
        description: 'Techniques fondamentales des soins infirmiers',
        level: 'intermediate',
        icon: 'medical_services',
        chapters: [
          {
            id: 'chapter-3',
            moduleId: 'module-2',
            title: 'Hygiène et sécurité',
            lessons: [
              {
                id: 'lesson-4',
                chapterId: 'chapter-3',
                title: 'Lavage des mains',
                content: `# Lavage des mains

Le lavage des mains est une procédure essentielle pour prévenir les infections nosocomiales.

## Pourquoi se laver les mains?

L'hygiène des mains est la mesure la plus efficace pour:
- Prévenir la transmission des infections
- Protéger les patients
- Protéger le personnel soignant
- Réduire la résistance aux antibiotiques

## Les 5 moments de l'hygiène des mains

1. **Avant le contact avec le patient**
2. **Avant un geste aseptique**
3. **Après exposition à un liquide biologique**
4. **Après contact avec le patient**
5. **Après contact avec l'environnement du patient**

## Technique de lavage

### Lavage simple (40-60 secondes)
1. Mouiller les mains
2. Appliquer du savon
3. Frotter paume contre paume
4. Frotter le dos des mains
5. Frotter entre les doigts
6. Frotter les pouces
7. Frotter le bout des doigts
8. Rincer abondamment
9. Sécher avec une serviette jetable

### Friction hydro-alcoolique (20-30 secondes)
Même technique de frottage mais avec une solution hydro-alcoolique.

## Points importants

- Retirer bijoux et montre
- Ongles courts et propres
- Pas de vernis à ongles
- Couvrir les plaies
- Ne pas toucher les robinets avec les mains propres`,
                type: 'video',
                duration: 10,
                order: 1,
                videoUrl: 'https://example.com/hand-washing-video.mp4',
                quizId: 'quiz-3',
              },
            ],
            estimatedTime: 10,
            order: 1,
          },
        ],
        createdAt: new Date('2025-01-15'),
      },
    ];

    const mockQuizzes: Quiz[] = [
      {
        id: 'quiz-1',
        lessonId: 'lesson-2',
        title: 'Quiz: Terminologie anatomique',
        questions: [
          {
            id: 'q1-1',
            quizId: 'quiz-1',
            question: "Quelle est la position de référence en anatomie?",
            answers: [
              'Allongé sur le dos',
              'Debout, bras le long du corps, paumes vers l\'avant',
              'Assis avec les jambes croisées',
              'Debout avec les bras levés',
            ],
            correctAnswer: 1,
            explanation: 'La position anatomique de référence est debout, face à l\'observateur, bras le long du corps, paumes tournées vers l\'avant.',
            type: 'single',
          },
          {
            id: 'q1-2',
            quizId: 'quiz-1',
            question: "Quel plan divise le corps en parties droite et gauche?",
            answers: ['Plan frontal', 'Plan sagittal', 'Plan transversal', 'Plan oblique'],
            correctAnswer: 1,
            explanation: 'Le plan sagittal divise le corps en parties droite et gauche.',
            type: 'single',
          },
          {
            id: 'q1-3',
            quizId: 'quiz-1',
            question: "Que signifie le terme 'antérieur'?",
            answers: ['Vers l\'arrière', 'Vers l\'avant', 'Vers le haut', 'Vers le bas'],
            correctAnswer: 1,
            explanation: 'Antérieur (ou ventral) signifie vers l\'avant du corps.',
            type: 'single',
          },
          {
            id: 'q1-4',
            quizId: 'quiz-1',
            question: "Le terme 'proximal' signifie:",
            answers: [
              'Près du point d\'attache',
              'Loin du point d\'attache',
              'Vers le milieu',
              'Vers le côté',
            ],
            correctAnswer: 0,
            explanation: 'Proximal signifie près du point d\'attache ou de référence.',
            type: 'single',
          },
          {
            id: 'q1-5',
            quizId: 'quiz-1',
            question: "Quel terme désigne la partie vers le haut du corps?",
            answers: ['Inférieur', 'Distal', 'Supérieur', 'Latéral'],
            correctAnswer: 2,
            explanation: 'Supérieur (ou crânial) désigne ce qui est vers le haut du corps.',
            type: 'single',
          },
          {
            id: 'q1-6',
            quizId: 'quiz-1',
            question: "Le plan transversal divise le corps en:",
            answers: [
              'Parties droite et gauche',
              'Parties antérieure et postérieure',
              'Parties supérieure et inférieure',
              'Parties médiale et latérale',
            ],
            correctAnswer: 2,
            explanation: 'Le plan transversal (ou horizontal) divise le corps en parties supérieure et inférieure.',
            type: 'single',
          },
          {
            id: 'q1-7',
            quizId: 'quiz-1',
            question: "Que signifie 'médial'?",
            answers: ['Vers le côté', 'Vers le milieu', 'Vers l\'avant', 'Vers l\'arrière'],
            correctAnswer: 1,
            explanation: 'Médial signifie vers le milieu ou la ligne médiane du corps.',
            type: 'single',
          },
          {
            id: 'q1-8',
            quizId: 'quiz-1',
            question: "Le terme 'dorsal' est synonyme de:",
            answers: ['Antérieur', 'Postérieur', 'Supérieur', 'Inférieur'],
            correctAnswer: 1,
            explanation: 'Dorsal est synonyme de postérieur, signifiant vers l\'arrière.',
            type: 'single',
          },
          {
            id: 'q1-9',
            quizId: 'quiz-1',
            question: "Quel plan divise le corps en parties antérieure et postérieure?",
            answers: ['Plan sagittal', 'Plan frontal', 'Plan transversal', 'Plan médian'],
            correctAnswer: 1,
            explanation: 'Le plan frontal (ou coronal) divise le corps en parties antérieure et postérieure.',
            type: 'single',
          },
          {
            id: 'q1-10',
            quizId: 'quiz-1',
            question: "Pourquoi la terminologie anatomique est-elle importante?",
            answers: [
              'Pour impressionner les patients',
              'Pour communiquer précisément avec l\'équipe médicale',
              'C\'est une tradition médicale',
              'Pour compliquer les choses',
            ],
            correctAnswer: 1,
            explanation: 'La terminologie anatomique permet une communication précise et sans ambiguïté entre professionnels de santé.',
            type: 'single',
          },
        ],
        passingScore: 80,
        timeLimit: 15,
      },
      {
        id: 'quiz-2',
        lessonId: 'lesson-3',
        title: 'Quiz: Le système squelettique',
        questions: [
          {
            id: 'q2-1',
            quizId: 'quiz-2',
            question: "Combien d'os comprend le squelette d'un adulte?",
            answers: ['186 os', '196 os', '206 os', '216 os'],
            correctAnswer: 2,
            explanation: 'Le squelette adulte comprend 206 os.',
            type: 'single',
          },
          {
            id: 'q2-2',
            quizId: 'quiz-2',
            question: "Le squelette axial comprend:",
            answers: [
              'Les membres supérieurs et inférieurs',
              'Le crâne, la colonne vertébrale et la cage thoracique',
              'Uniquement les os des bras',
              'Uniquement les os des jambes',
            ],
            correctAnswer: 1,
            explanation: 'Le squelette axial comprend le crâne, la colonne vertébrale et la cage thoracique (80 os).',
            type: 'single',
          },
          {
            id: 'q2-3',
            quizId: 'quiz-2',
            question: "Quelle est une fonction du système squelettique?",
            answers: [
              'Digestion des aliments',
              'Production de cellules sanguines',
              'Filtration du sang',
              'Respiration',
            ],
            correctAnswer: 1,
            explanation: 'La moelle osseuse produit les cellules sanguines (fonction hématopoïétique).',
            type: 'single',
          },
          {
            id: 'q2-4',
            quizId: 'quiz-2',
            question: "Les os longs comme le fémur servent principalement à:",
            answers: [
              'Protéger les organes',
              'Servir de leviers pour le mouvement',
              'Stocker les graisses',
              'Produire des hormones',
            ],
            correctAnswer: 1,
            explanation: 'Les os longs servent principalement de leviers pour faciliter les mouvements.',
            type: 'single',
          },
          {
            id: 'q2-5',
            quizId: 'quiz-2',
            question: "Combien d'os composent le crâne?",
            answers: ['12 os', '22 os', '32 os', '42 os'],
            correctAnswer: 1,
            explanation: 'Le crâne est composé de 22 os.',
            type: 'single',
          },
          {
            id: 'q2-6',
            quizId: 'quiz-2',
            question: "Quel type d'os est le sternum?",
            answers: ['Os long', 'Os court', 'Os plat', 'Os irrégulier'],
            correctAnswer: 2,
            explanation: 'Le sternum est un os plat qui protège le cœur et les poumons.',
            type: 'single',
          },
          {
            id: 'q2-7',
            quizId: 'quiz-2',
            question: "Le squelette appendiculaire comprend combien d'os?",
            answers: ['80 os', '106 os', '126 os', '146 os'],
            correctAnswer: 2,
            explanation: 'Le squelette appendiculaire comprend 126 os (membres et ceintures).',
            type: 'single',
          },
          {
            id: 'q2-8',
            quizId: 'quiz-2',
            question: "Quels minéraux sont principalement stockés dans les os?",
            answers: [
              'Fer et zinc',
              'Calcium et phosphore',
              'Sodium et potassium',
              'Magnésium et cuivre',
            ],
            correctAnswer: 1,
            explanation: 'Les os stockent principalement le calcium et le phosphore.',
            type: 'single',
          },
          {
            id: 'q2-9',
            quizId: 'quiz-2',
            question: "Les vertèbres sont des exemples d'os:",
            answers: ['Longs', 'Courts', 'Plats', 'Irréguliers'],
            correctAnswer: 3,
            explanation: 'Les vertèbres sont des os irréguliers avec des formes spécialisées.',
            type: 'single',
          },
          {
            id: 'q2-10',
            quizId: 'quiz-2',
            question: "La cage thoracique comprend combien d'os?",
            answers: ['15 os', '20 os', '25 os', '30 os'],
            correctAnswer: 2,
            explanation: 'La cage thoracique comprend 25 os (24 côtes + 1 sternum).',
            type: 'single',
          },
        ],
        passingScore: 80,
        timeLimit: 15,
      },
      {
        id: 'quiz-3',
        lessonId: 'lesson-4',
        title: 'Quiz: Lavage des mains',
        questions: [
          {
            id: 'q3-1',
            quizId: 'quiz-3',
            question: "Quelle est la durée recommandée pour un lavage simple des mains?",
            answers: ['10-20 secondes', '20-30 secondes', '40-60 secondes', '60-90 secondes'],
            correctAnswer: 2,
            explanation: 'Un lavage simple des mains doit durer 40 à 60 secondes pour être efficace.',
            type: 'single',
          },
          {
            id: 'q3-2',
            quizId: 'quiz-3',
            question: "Combien de moments d'hygiène des mains l'OMS recommande-t-elle?",
            answers: ['3 moments', '5 moments', '7 moments', '10 moments'],
            correctAnswer: 1,
            explanation: 'L\'OMS recommande 5 moments clés pour l\'hygiène des mains.',
            type: 'single',
          },
          {
            id: 'q3-3',
            quizId: 'quiz-3',
            question: "Quand doit-on se laver les mains? (moment 1)",
            answers: [
              'Après le contact avec le patient',
              'Avant le contact avec le patient',
              'Après un geste aseptique',
              'Après exposition à un liquide biologique',
            ],
            correctAnswer: 1,
            explanation: 'Le premier moment est avant le contact avec le patient.',
            type: 'single',
          },
          {
            id: 'q3-4',
            quizId: 'quiz-3',
            question: "Quelle est la durée d'une friction hydro-alcoolique?",
            answers: ['10-15 secondes', '20-30 secondes', '40-60 secondes', '60-90 secondes'],
            correctAnswer: 1,
            explanation: 'Une friction hydro-alcoolique doit durer 20 à 30 secondes.',
            type: 'single',
          },
          {
            id: 'q3-5',
            quizId: 'quiz-3',
            question: "Que doit-on retirer avant de se laver les mains?",
            answers: [
              'Uniquement les gants',
              'Uniquement la montre',
              'Les bijoux et la montre',
              'Rien de particulier',
            ],
            correctAnswer: 2,
            explanation: 'Il faut retirer les bijoux et la montre qui peuvent héberger des microbes.',
            type: 'single',
          },
          {
            id: 'q3-6',
            quizId: 'quiz-3',
            question: "Pourquoi l'hygiène des mains est-elle importante?",
            answers: [
              'Pour avoir les mains douces',
              'Pour prévenir les infections nosocomiales',
              'C\'est une règle administrative',
              'Pour sentir bon',
            ],
            correctAnswer: 1,
            explanation: 'L\'hygiène des mains est la mesure la plus efficace pour prévenir les infections nosocomiales.',
            type: 'single',
          },
          {
            id: 'q3-7',
            quizId: 'quiz-3',
            question: "Les ongles du personnel soignant doivent être:",
            answers: [
              'Longs et vernis',
              'Courts et propres',
              'De longueur moyenne',
              'Décorés avec des bijoux',
            ],
            correctAnswer: 1,
            explanation: 'Les ongles doivent être courts et propres, sans vernis, pour éviter l\'accumulation de microbes.',
            type: 'single',
          },
          {
            id: 'q3-8',
            quizId: 'quiz-3',
            question: "Après avoir rincé les mains, comment doit-on les sécher?",
            answers: [
              'Les laisser sécher à l\'air',
              'Avec une serviette en tissu',
              'Avec une serviette jetable',
              'En les secouant',
            ],
            correctAnswer: 2,
            explanation: 'Les mains doivent être séchées avec une serviette jetable pour éviter la recontamination.',
            type: 'single',
          },
          {
            id: 'q3-9',
            quizId: 'quiz-3',
            question: "Quand utiliser une friction hydro-alcoolique plutôt qu'un lavage?",
            answers: [
              'Quand les mains sont visiblement sales',
              'Quand les mains ne sont pas visiblement souillées',
              'Jamais, toujours laver à l\'eau',
              'Uniquement le matin',
            ],
            correctAnswer: 1,
            explanation: 'La friction hydro-alcoolique est appropriée quand les mains ne sont pas visiblement souillées.',
            type: 'single',
          },
          {
            id: 'q3-10',
            quizId: 'quiz-3',
            question: "Quelle zone des mains est souvent oubliée lors du lavage?",
            answers: ['Les paumes', 'Les pouces', 'Le dos des mains', 'Les poignets'],
            correctAnswer: 1,
            explanation: 'Les pouces sont souvent oubliés lors du lavage des mains, d\'où l\'importance de la technique complète.',
            type: 'single',
          },
        ],
        passingScore: 80,
        timeLimit: 15,
      },
    ];

    this.modulesSubject.next(mockModules);
    this.quizzesSubject.next(mockQuizzes);

    // Initialize mock enrollments
    this.userService.getCurrentUser().subscribe(user => {
      if (user) {
        const mockEnrollments: UserCourseEnrollment[] = [
          {
            userId: user.id,
            moduleId: 'module-1',
            startDate: new Date('2025-01-15'),
            lastAccessedDate: new Date('2025-02-10'),
          },
          {
            userId: user.id,
            moduleId: 'module-2',
            startDate: new Date('2025-02-01'),
            lastAccessedDate: new Date('2025-02-08'),
          },
        ];
        this.enrollmentsSubject.next(mockEnrollments);

        // Initialize some mock progress
        const mockProgress: UserProgress = {
          userId: user.id,
          completedLessons: ['lesson-1', 'lesson-2'],
          quizScores: [
            {
              quizId: 'quiz-1',
              score: 90,
              attempts: 1,
              lastAttempt: new Date('2025-02-05'),
              passed: true,
            },
          ],
          totalProgress: 0,
          moduleProgress: [],
        };
        this.updateProgress(mockProgress);
      }
    });
  }

  /**
   * Reset user progress (for testing purposes)
   */
  resetProgress(): Observable<void> {
    this.progressSubject.next({
      completedLessons: [],
      quizScores: [],
      totalProgress: 0,
      moduleProgress: [],
    });
    return of(void 0);
  }
}
