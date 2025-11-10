import { Module, Quiz } from '../../models/course.model';

/**
 * Mock course modules data
 * This file contains all mock data for courses, chapters, and lessons
 */
export const MOCK_MODULES: Module[] = [
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

L'anatomie est l'étude scientifique de la structure du corps humain et de ses différentes parties.`,
            type: 'text',
            duration: 15,
            order: 1,
          },
          {
            id: 'lesson-2',
            chapterId: 'chapter-1',
            title: 'Terminologie anatomique',
            content: `# Terminologie anatomique

La terminologie anatomique utilise des termes spécifiques pour décrire les positions.`,
            type: 'text',
            quizId: 'quiz-1',
            duration: 20,
            order: 2,
          },
          {
            id: 'lesson-3',
            chapterId: 'chapter-1',
            title: 'Plans et axes du corps',
            content: `# Plans et axes du corps

Les plans anatomiques divisent le corps en sections pour faciliter l'étude.`,
            type: 'text',
            duration: 18,
            order: 3,
          },
          {
            id: 'lesson-4',
            chapterId: 'chapter-1',
            title: 'Régions anatomiques',
            content: `# Régions anatomiques

Le corps humain est divisé en plusieurs régions anatomiques distinctes.`,
            type: 'text',
            duration: 22,
            order: 4,
          },
        ],
        estimatedTime: 75,
        order: 1,
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
        id: 'chapter-2',
        moduleId: 'module-2',
        title: 'Hygiène et sécurité',
        lessons: [
          {
            id: 'lesson-5',
            chapterId: 'chapter-2',
            title: 'Lavage des mains',
            content: `# Lavage des mains

Le lavage des mains est essentiel pour prévenir les infections.`,
            type: 'video',
            duration: 10,
            order: 1,
            quizId: 'quiz-2',
          },
          {
            id: 'lesson-6',
            chapterId: 'chapter-2',
            title: 'Port des équipements de protection',
            content: `# Équipements de protection individuelle

Les EPI sont essentiels pour la sécurité du personnel et des patients.`,
            type: 'text',
            duration: 15,
            order: 2,
          },
          {
            id: 'lesson-7',
            chapterId: 'chapter-2',
            title: 'Désinfection et stérilisation',
            content: `# Désinfection et stérilisation

Comprendre les différentes méthodes de nettoyage et de stérilisation.`,
            type: 'text',
            duration: 20,
            order: 3,
          },
          {
            id: 'lesson-8',
            chapterId: 'chapter-2',
            title: 'Gestion des déchets médicaux',
            content: `# Gestion des déchets médicaux

Tri et élimination appropriés des déchets médicaux.`,
            type: 'text',
            duration: 12,
            order: 4,
          },
        ],
        estimatedTime: 57,
        order: 1,
      },
    ],
    createdAt: new Date('2025-01-15'),
  },
  {
    id: 'module-3',
    title: 'Pharmacologie clinique',
    description: 'Principes de base de la pharmacologie pour les soins infirmiers',
    level: 'intermediate',
    icon: 'medication',
    chapters: [
      {
        id: 'chapter-3',
        moduleId: 'module-3',
        title: 'Introduction à la pharmacologie',
        lessons: [
          {
            id: 'lesson-9',
            chapterId: 'chapter-3',
            title: 'Principes pharmacologiques de base',
            content: `# Principes pharmacologiques

La pharmacologie étudie les médicaments et leurs effets sur le corps.`,
            type: 'text',
            duration: 25,
            order: 1,
          },
          {
            id: 'lesson-10',
            chapterId: 'chapter-3',
            title: 'Voies d\'administration',
            content: `# Voies d'administration des médicaments

Différentes voies pour administrer les médicaments.`,
            type: 'video',
            duration: 20,
            order: 2,
          },
          {
            id: 'lesson-11',
            chapterId: 'chapter-3',
            title: 'Calcul de doses',
            content: `# Calcul de doses médicamenteuses

Méthodes de calcul précis des doses de médicaments.`,
            type: 'interactive',
            duration: 30,
            order: 3,
            quizId: 'quiz-3',
          },
          {
            id: 'lesson-12',
            chapterId: 'chapter-3',
            title: 'Effets secondaires et interactions',
            content: `# Effets secondaires et interactions médicamenteuses

Reconnaître et gérer les effets indésirables.`,
            type: 'text',
            duration: 22,
            order: 4,
          },
        ],
        estimatedTime: 97,
        order: 1,
      },
    ],
    createdAt: new Date('2025-02-01'),
  },
  {
    id: 'module-4',
    title: 'Communication thérapeutique',
    description: 'Techniques de communication efficace avec les patients',
    level: 'beginner',
    icon: 'forum',
    chapters: [
      {
        id: 'chapter-4',
        moduleId: 'module-4',
        title: 'Bases de la communication',
        lessons: [
          {
            id: 'lesson-13',
            chapterId: 'chapter-4',
            title: 'Écoute active',
            content: `# L'écoute active

L'écoute active est une compétence essentielle en soins infirmiers.`,
            type: 'text',
            duration: 18,
            order: 1,
          },
          {
            id: 'lesson-14',
            chapterId: 'chapter-4',
            title: 'Communication verbale et non-verbale',
            content: `# Communication verbale et non-verbale

Comprendre les différentes formes de communication.`,
            type: 'video',
            duration: 20,
            order: 2,
          },
          {
            id: 'lesson-15',
            chapterId: 'chapter-4',
            title: 'Gestion des situations difficiles',
            content: `# Gérer les situations difficiles

Techniques pour gérer les patients anxieux ou agressifs.`,
            type: 'text',
            duration: 25,
            order: 3,
            quizId: 'quiz-4',
          },
          {
            id: 'lesson-16',
            chapterId: 'chapter-4',
            title: 'Communication interculturelle',
            content: `# Communication interculturelle

Adapter sa communication aux différences culturelles.`,
            type: 'text',
            duration: 20,
            order: 4,
          },
        ],
        estimatedTime: 83,
        order: 1,
      },
    ],
    createdAt: new Date('2025-02-10'),
  },
];

/**
 * Mock quizzes data
 */
export const MOCK_QUIZZES: Quiz[] = [
  {
    id: 'quiz-1',
    lessonId: 'lesson-2',
    title: 'Quiz: Terminologie anatomique',
    questions: [
      {
        id: 'q1-1',
        quizId: 'quiz-1',
        question: 'Quelle est la position de référence en anatomie?',
        answers: [
          'Allongé sur le dos',
          "Debout, bras le long du corps, paumes vers l'avant",
          'Assis avec les jambes croisées',
        ],
        correctAnswer: 1,
        explanation: 'La position anatomique de référence est debout.',
        type: 'single',
      },
    ],
    passingScore: 80,
    timeLimit: 15,
  },
  {
    id: 'quiz-2',
    lessonId: 'lesson-5',
    title: 'Quiz: Lavage des mains',
    questions: [
      {
        id: 'q2-1',
        quizId: 'quiz-2',
        question: 'Quelle est la durée recommandée pour un lavage simple des mains?',
        answers: ['10-20 secondes', '20-30 secondes', '40-60 secondes'],
        correctAnswer: 2,
        explanation: 'Un lavage simple doit durer 40 à 60 secondes.',
        type: 'single',
      },
    ],
    passingScore: 80,
    timeLimit: 15,
  },
  {
    id: 'quiz-3',
    lessonId: 'lesson-11',
    title: 'Quiz: Calcul de doses',
    questions: [
      {
        id: 'q3-1',
        quizId: 'quiz-3',
        question: 'Quelle est l\'unité standard pour mesurer les doses liquides?',
        answers: ['Millilitres', 'Grammes', 'Cuillères'],
        correctAnswer: 0,
        explanation: 'Les millilitres sont l\'unité standard.',
        type: 'single',
      },
    ],
    passingScore: 80,
    timeLimit: 20,
  },
  {
    id: 'quiz-4',
    lessonId: 'lesson-15',
    title: 'Quiz: Gestion des situations difficiles',
    questions: [
      {
        id: 'q4-1',
        quizId: 'quiz-4',
        question: 'Quelle est la première étape face à un patient anxieux?',
        answers: ['Appeler la sécurité', 'Écouter avec empathie', 'Ignorer l\'anxiété'],
        correctAnswer: 1,
        explanation: 'L\'écoute empathique est essentielle.',
        type: 'single',
      },
    ],
    passingScore: 80,
    timeLimit: 15,
  },
];
