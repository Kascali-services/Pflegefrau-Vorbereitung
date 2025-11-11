/**
 * Mock data for development and testing
 * Following the new database schema
 */

import {
  Course,
  Lesson,
  Quiz,
  Question,
  QuizOption,
} from '../../models/course.model';
import {
  UserProgress,
  UserQuizAttempt,
} from '../../models/progress.model';
import { User, UserCourseEnrollment } from '../../models/user.model';

/**
 * Mock Users
 */
export const MOCK_USERS: User[] = [
  {
    id: 'user-001',
    email: 'marie.dupont@example.com',
    firstName: 'Marie',
    lastName: 'Dupont',
    avatarUrl: undefined,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    lastLoginAt: new Date('2025-02-10'),
  },
];

/**
 * Mock Courses
 */
export const MOCK_COURSES: Course[] = [
  {
    id: 'course-1',
    title: 'Vocabulaire anatomique',
    description: 'Apprenez les termes anatomiques essentiels pour les soins infirmiers',
    thumbnailUrl: '/assets/placeholders/anatomie.png',
    level: 'beginner',
    durationMinutes: 120,
    lessonsCount: 3,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'course-2',
    title: 'Soins infirmiers de base',
    description: 'Techniques fondamentales des soins infirmiers',
    thumbnailUrl: '/assets/placeholders/anatomie.png',
    level: 'intermediate',
    durationMinutes: 60,
    lessonsCount: 1,
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
];

/**
 * Mock Lessons
 */
export const MOCK_LESSONS: Lesson[] = [
  // Course 1 lessons
  {
    id: 'lesson-1',
    courseId: 'course-1',
    title: "Les bases de l'anatomie",
    description: "Introduction à l'étude de l'anatomie humaine",
    contentMdPath: '/assets/content/lesson-1.md',
    durationMinutes: 15,
    orderIndex: 1,
    type: 'text',
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'lesson-2',
    courseId: 'course-1',
    title: 'Terminologie anatomique',
    description: 'Apprenez les termes et positions anatomiques standard',
    contentMdPath: '/assets/content/lesson-2.md',
    durationMinutes: 20,
    orderIndex: 2,
    type: 'text',
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'lesson-3',
    courseId: 'course-1',
    title: 'Le système squelettique',
    description: 'Découvrez la structure et les fonctions du squelette humain',
    contentMdPath: '/assets/content/lesson-3.md',
    durationMinutes: 25,
    orderIndex: 3,
    type: 'text',
    createdAt: new Date('2025-01-01'),
  },
  // Course 2 lessons
  {
    id: 'lesson-4',
    courseId: 'course-2',
    title: 'Lavage des mains',
    description: 'Technique essentielle pour prévenir les infections',
    contentMdPath: '/assets/content/lesson-4.md',
    durationMinutes: 10,
    orderIndex: 1,
    type: 'video',
    createdAt: new Date('2025-01-15'),
  },
];

/**
 * Mock Quizzes
 */
export const MOCK_QUIZZES: Quiz[] = [
  {
    id: 'quiz-1',
    lessonId: 'lesson-2',
    title: 'Quiz: Terminologie anatomique',
    passingScore: 80,
    questionsCount: 10,
    timeLimitMinutes: 15,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'quiz-2',
    lessonId: 'lesson-3',
    title: 'Quiz: Le système squelettique',
    passingScore: 80,
    questionsCount: 10,
    timeLimitMinutes: 15,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'quiz-3',
    lessonId: 'lesson-4',
    title: 'Quiz: Lavage des mains',
    passingScore: 80,
    questionsCount: 10,
    timeLimitMinutes: 15,
    createdAt: new Date('2025-01-15'),
  },
];

/**
 * Mock Questions
 */
export const MOCK_QUESTIONS: Question[] = [
  // Quiz 1 - Terminologie anatomique
  {
    id: 'q1-1',
    quizId: 'quiz-1',
    questionText: 'Quelle est la position de référence en anatomie?',
    type: 'qcm',
    explanation:
      "La position anatomique de référence est debout, face à l'observateur, bras le long du corps, paumes tournées vers l'avant.",
    orderIndex: 1,
    points: 1,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'q1-2',
    quizId: 'quiz-1',
    questionText: 'Quel plan divise le corps en parties droite et gauche?',
    type: 'qcm',
    explanation: 'Le plan sagittal divise le corps en parties droite et gauche.',
    orderIndex: 2,
    points: 1,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'q1-3',
    quizId: 'quiz-1',
    questionText: "Le terme 'antérieur' signifie vers l'avant du corps.",
    type: 'vrai_faux',
    explanation: "Antérieur (ou ventral) signifie vers l'avant du corps.",
    orderIndex: 3,
    points: 1,
    createdAt: new Date('2025-01-01'),
  },
  // Quiz 2 - Système squelettique
  {
    id: 'q2-1',
    quizId: 'quiz-2',
    questionText: "Combien d'os comprend le squelette d'un adulte?",
    type: 'qcm',
    explanation: 'Le squelette adulte comprend 206 os.',
    orderIndex: 1,
    points: 1,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'q2-2',
    quizId: 'quiz-2',
    questionText: 'Le squelette axial comprend:',
    type: 'qcm',
    explanation:
      'Le squelette axial comprend le crâne, la colonne vertébrale et la cage thoracique (80 os).',
    orderIndex: 2,
    points: 1,
    createdAt: new Date('2025-01-01'),
  },
  // Quiz 3 - Lavage des mains
  {
    id: 'q3-1',
    quizId: 'quiz-3',
    questionText: 'Quelle est la durée recommandée pour un lavage simple des mains?',
    type: 'qcm',
    explanation:
      'Un lavage simple des mains doit durer 40 à 60 secondes pour être efficace.',
    orderIndex: 1,
    points: 1,
    createdAt: new Date('2025-01-15'),
  },
  {
    id: 'q3-2',
    quizId: 'quiz-3',
    questionText: "L'hygiène des mains prévient les infections nosocomiales.",
    type: 'vrai_faux',
    explanation:
      "L'hygiène des mains est la mesure la plus efficace pour prévenir les infections nosocomiales.",
    orderIndex: 2,
    points: 1,
    createdAt: new Date('2025-01-15'),
  },
];

/**
 * Mock Quiz Options
 */
export const MOCK_QUIZ_OPTIONS: QuizOption[] = [
  // Question q1-1 options
  {
    id: 'opt-q1-1-1',
    questionId: 'q1-1',
    optionText: 'Allongé sur le dos',
    isCorrect: false,
    orderIndex: 1,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'opt-q1-1-2',
    questionId: 'q1-1',
    optionText: "Debout, bras le long du corps, paumes vers l'avant",
    isCorrect: true,
    orderIndex: 2,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'opt-q1-1-3',
    questionId: 'q1-1',
    optionText: 'Assis avec les jambes croisées',
    isCorrect: false,
    orderIndex: 3,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'opt-q1-1-4',
    questionId: 'q1-1',
    optionText: 'Debout avec les bras levés',
    isCorrect: false,
    orderIndex: 4,
    createdAt: new Date('2025-01-01'),
  },
  // Question q1-2 options
  {
    id: 'opt-q1-2-1',
    questionId: 'q1-2',
    optionText: 'Plan frontal',
    isCorrect: false,
    orderIndex: 1,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'opt-q1-2-2',
    questionId: 'q1-2',
    optionText: 'Plan sagittal',
    isCorrect: true,
    orderIndex: 2,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'opt-q1-2-3',
    questionId: 'q1-2',
    optionText: 'Plan transversal',
    isCorrect: false,
    orderIndex: 3,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'opt-q1-2-4',
    questionId: 'q1-2',
    optionText: 'Plan oblique',
    isCorrect: false,
    orderIndex: 4,
    createdAt: new Date('2025-01-01'),
  },
  // Question q1-3 options (True/False)
  {
    id: 'opt-q1-3-1',
    questionId: 'q1-3',
    optionText: 'Vrai',
    isCorrect: true,
    orderIndex: 1,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'opt-q1-3-2',
    questionId: 'q1-3',
    optionText: 'Faux',
    isCorrect: false,
    orderIndex: 2,
    createdAt: new Date('2025-01-01'),
  },
  // Question q2-1 options
  {
    id: 'opt-q2-1-1',
    questionId: 'q2-1',
    optionText: '186 os',
    isCorrect: false,
    orderIndex: 1,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'opt-q2-1-2',
    questionId: 'q2-1',
    optionText: '196 os',
    isCorrect: false,
    orderIndex: 2,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'opt-q2-1-3',
    questionId: 'q2-1',
    optionText: '206 os',
    isCorrect: true,
    orderIndex: 3,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'opt-q2-1-4',
    questionId: 'q2-1',
    optionText: '216 os',
    isCorrect: false,
    orderIndex: 4,
    createdAt: new Date('2025-01-01'),
  },
  // Question q2-2 options
  {
    id: 'opt-q2-2-1',
    questionId: 'q2-2',
    optionText: 'Les membres supérieurs et inférieurs',
    isCorrect: false,
    orderIndex: 1,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'opt-q2-2-2',
    questionId: 'q2-2',
    optionText: 'Le crâne, la colonne vertébrale et la cage thoracique',
    isCorrect: true,
    orderIndex: 2,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'opt-q2-2-3',
    questionId: 'q2-2',
    optionText: 'Uniquement les os des bras',
    isCorrect: false,
    orderIndex: 3,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'opt-q2-2-4',
    questionId: 'q2-2',
    optionText: 'Uniquement les os des jambes',
    isCorrect: false,
    orderIndex: 4,
    createdAt: new Date('2025-01-01'),
  },
  // Question q3-1 options
  {
    id: 'opt-q3-1-1',
    questionId: 'q3-1',
    optionText: '10-20 secondes',
    isCorrect: false,
    orderIndex: 1,
    createdAt: new Date('2025-01-15'),
  },
  {
    id: 'opt-q3-1-2',
    questionId: 'q3-1',
    optionText: '20-30 secondes',
    isCorrect: false,
    orderIndex: 2,
    createdAt: new Date('2025-01-15'),
  },
  {
    id: 'opt-q3-1-3',
    questionId: 'q3-1',
    optionText: '40-60 secondes',
    isCorrect: true,
    orderIndex: 3,
    createdAt: new Date('2025-01-15'),
  },
  {
    id: 'opt-q3-1-4',
    questionId: 'q3-1',
    optionText: '60-90 secondes',
    isCorrect: false,
    orderIndex: 4,
    createdAt: new Date('2025-01-15'),
  },
  // Question q3-2 options (True/False)
  {
    id: 'opt-q3-2-1',
    questionId: 'q3-2',
    optionText: 'Vrai',
    isCorrect: true,
    orderIndex: 1,
    createdAt: new Date('2025-01-15'),
  },
  {
    id: 'opt-q3-2-2',
    questionId: 'q3-2',
    optionText: 'Faux',
    isCorrect: false,
    orderIndex: 2,
    createdAt: new Date('2025-01-15'),
  },
];

/**
 * Mock User Course Enrollments
 */
export const MOCK_ENROLLMENTS: UserCourseEnrollment[] = [
  {
    id: 'enrollment-1',
    userId: 'user-001',
    courseId: 'course-1',
    enrolledAt: new Date('2025-01-15'),
    lastAccessedAt: new Date('2025-02-10'),
  },
  {
    id: 'enrollment-2',
    userId: 'user-001',
    courseId: 'course-2',
    enrolledAt: new Date('2025-02-01'),
    lastAccessedAt: new Date('2025-02-08'),
  },
];

/**
 * Mock User Progress
 */
export const MOCK_USER_PROGRESS: UserProgress[] = [
  {
    id: 'progress-1',
    userId: 'user-001',
    lessonId: 'lesson-1',
    isCompleted: true,
    bestScore: 0, // No quiz for this lesson
    attemptCount: 0,
    timeSpentMinutes: 15,
    lastAttemptAt: undefined,
    completedAt: new Date('2025-02-01'),
    createdAt: new Date('2025-02-01'),
    updatedAt: new Date('2025-02-01'),
  },
  {
    id: 'progress-2',
    userId: 'user-001',
    lessonId: 'lesson-2',
    isCompleted: true,
    bestScore: 90,
    attemptCount: 1,
    timeSpentMinutes: 25,
    lastAttemptAt: new Date('2025-02-05'),
    completedAt: new Date('2025-02-05'),
    createdAt: new Date('2025-02-02'),
    updatedAt: new Date('2025-02-05'),
  },
];

/**
 * Mock User Quiz Attempts
 */
export const MOCK_QUIZ_ATTEMPTS: UserQuizAttempt[] = [
  {
    id: 'attempt-1',
    userId: 'user-001',
    quizId: 'quiz-1',
    lessonId: 'lesson-2',
    score: 90,
    passed: true,
    attemptNumber: 1,
    timeTakenMinutes: 10,
    answers: [
      {
        questionId: 'q1-1',
        selectedOptions: ['opt-q1-1-2'],
        isCorrect: true,
      },
      {
        questionId: 'q1-2',
        selectedOptions: ['opt-q1-2-2'],
        isCorrect: true,
      },
      {
        questionId: 'q1-3',
        selectedOptions: ['opt-q1-3-1'],
        isCorrect: true,
      },
    ],
    completedAt: new Date('2025-02-05'),
  },
];

/**
 * Content for lessons (inline for now, will be in separate .md files later)
 */
export const MOCK_LESSON_CONTENT: Record<string, string> = {
  'lesson-1': `# Les bases de l'anatomie

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

  'lesson-2': `# Terminologie anatomique

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

  'lesson-3': `# Le système squelettique

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

  'lesson-4': `# Lavage des mains

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
};
