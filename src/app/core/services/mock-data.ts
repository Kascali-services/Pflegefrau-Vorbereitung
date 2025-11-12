/**
 * Mock data for development and testing
 * Following the new database schema
 */

import {
  Course,
  Lesson,
  LessonContent,
  Quiz,
  Question,
  QuizOption,
} from '../../models/course.model';
import {
  UserProgress,
  UserQuizAttempt,
} from '../../models/progress.model';
import { UserCourseEnrollment } from '../../models/user.model';

/**
 * Mock Courses
 */
export const MOCK_COURSES: Course[] = [
  {
    id: 'course-1',
    title: 'Anatomisches Vokabular',
    description: 'Lernen Sie die wesentlichen anatomischen Begriffe für die Krankenpflege',
    thumbnailUrl: '/assets/placeholders/anatomie.png',
    level: 'beginner',
    durationMinutes: 120,
    lessonsCount: 3,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'course-2',
    title: 'Grundlegende Krankenpflege',
    description: 'Grundlegende Techniken der Krankenpflege',
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
    title: "Grundlagen der Anatomie",
    description: "Einführung in das Studium der menschlichen Anatomie",
    durationMinutes: 15,
    orderIndex: 1,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'lesson-2',
    courseId: 'course-1',
    title: 'Anatomische Terminologie',
    description: 'Lernen Sie die anatomischen Standardbegriffe und Positionen',
    durationMinutes: 20,
    orderIndex: 2,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'lesson-3',
    courseId: 'course-1',
    title: 'Das Skelettsystem',
    description: 'Entdecken Sie die Struktur und Funktionen des menschlichen Skeletts',
    durationMinutes: 25,
    orderIndex: 3,
    createdAt: new Date('2025-01-01'),
  },
  // Course 2 lessons
  {
    id: 'lesson-4',
    courseId: 'course-2',
    title: 'Händewaschen',
    description: 'Wesentliche Technik zur Infektionsprävention',
    durationMinutes: 10,
    orderIndex: 1,
    createdAt: new Date('2025-01-15'),
  },
];

/**
 * Mock Lesson Contents
 * Each lesson can have multiple content items (text, video, image)
 */
export const MOCK_LESSON_CONTENTS: LessonContent[] = [
  // Lesson 1 contents
  {
    id: 'content-1-1',
    lessonId: 'lesson-1',
    contentType: 'text',
    contentValue: `# Grundlagen der Anatomie

Die Anatomie ist die wissenschaftliche Untersuchung der Struktur des menschlichen Körpers und seiner verschiedenen Teile. Sie ist eine grundlegende Disziplin für alle Gesundheitsfachkräfte.

## Was ist Anatomie?

Die menschliche Anatomie ist ein Zweig der Biologie, der untersucht:
- Die Struktur der Organe
- Die Körpersysteme
- Gewebe und Zellen
- Die Beziehungen zwischen verschiedenen Körperteilen

## Bedeutung für die Krankenpflege

Das Verständnis der Anatomie ist unerlässlich für:
1. Die korrekte Durchführung von Pflegemaßnahmen
2. Die Kommunikation mit medizinischem Fachpersonal
3. Das Erkennen von Anomalien
4. Das Verstehen von Pathologien

## Organisationsebenen

Der menschliche Körper ist in mehreren Ebenen organisiert:
- **Zellulär**: Zellen sind die Grundeinheiten
- **Gewebe**: Gewebe sind Gruppen ähnlicher Zellen
- **Organ**: Organe bestehen aus mehreren Geweben
- **System**: Systeme bestehen aus mehreren Organen`,
    orderIndex: 1,
    createdAt: new Date('2025-01-01'),
  },
  // Lesson 2 contents
  {
    id: 'content-2-1',
    lessonId: 'lesson-2',
    contentType: 'text',
    contentValue: `# Anatomische Terminologie

Die anatomische Terminologie verwendet spezifische Begriffe, um Positionen und Strukturen des menschlichen Körpers präzise zu beschreiben.

## Anatomische Standardposition

Die anatomische Referenzposition ist:
- Aufrecht stehend, dem Betrachter zugewandt
- Arme entlang des Körpers
- Handflächen nach vorne gedreht
- Füße leicht gespreizt

## Schnittebenen

### Sagittalebene
Teilt den Körper in rechte und linke Teile.

### Frontalebene (koronal)
Teilt den Körper in vordere und hintere Teile.

### Transversalebene (horizontal)
Teilt den Körper in obere und untere Teile.

## Positionsbegriffe

- **Anterior/Ventral**: Nach vorne
- **Posterior/Dorsal**: Nach hinten
- **Superior/Kranial**: Nach oben
- **Inferior/Kaudal**: Nach unten
- **Medial**: Zur Mitte hin
- **Lateral**: Zur Seite hin
- **Proximal**: Nahe am Befestigungspunkt
- **Distal**: Weit vom Befestigungspunkt

## Praktische Anwendung

Diese Begriffe werden täglich verwendet für:
- Dokumentation von Beobachtungen
- Kommunikation mit dem medizinischen Team
- Lokalisierung von Symptomen
- Beschreibung von Verfahren`,
    orderIndex: 1,
    createdAt: new Date('2025-01-01'),
  },
  // Lesson 3 contents
  {
    id: 'content-3-1',
    lessonId: 'lesson-3',
    contentType: 'text',
    contentValue: `# Das Skelettsystem

Das Skelettsystem umfasst alle Knochen des menschlichen Körpers und spielt eine entscheidende Rolle für unsere Funktion.

## Zusammensetzung des Skeletts

Das erwachsene Skelett umfasst **206 Knochen**, die in zwei Teile unterteilt sind:

### Axialskelett (80 Knochen)
- Schädel: 22 Knochen
- Wirbelsäule: 26 Knochen (Wirbel und Sakralbeinknochen)
- Brustkorb: 25 Knochen (Rippen und Brustbein)
- Zungenbein: 1 Knochen

### Appendikuläres Skelett (126 Knochen)
- Schultergürtel: 4 Knochen (Schlüsselbeine und Schulterblätter)
- Obere Extremitäten: 60 Knochen
- Beckengürtel: 2 Knochen (Hüftknochen)
- Untere Extremitäten: 60 Knochen

## Funktionen des Skelettsystems

1. **Stützfunktion**: Erhält die Körperstruktur
2. **Schutzfunktion**: Schützt lebenswichtige Organe
3. **Bewegung**: Dient als Ansatzpunkt für Muskeln
4. **Produktion**: Produziert Blutzellen (Knochenmark)
5. **Speicherung**: Speicher für Mineralien (Kalzium, Phosphor)

## Knochenarten

- **Lange Knochen**: Oberschenkelknochen, Oberarmknochen (Hebel für Bewegung)
- **Kurze Knochen**: Handwurzel-, Fußwurzelknochen (Stabilität)
- **Flache Knochen**: Schädel, Rippen (Schutz)
- **Unregelmäßige Knochen**: Wirbel (spezialisierte Funktionen)

## Klinische Bedeutung

Die Kenntnis des Skelettsystems ermöglicht:
- Das Verstehen von Frakturen
- Das Erkennen von Deformationen
- Die Unterstützung bei Mobilisierungen
- Das Erkennen von Knochenpathologien`,
    orderIndex: 1,
    createdAt: new Date('2025-01-01'),
  },
  // Lesson 4 contents - video lesson with text introduction
  {
    id: 'content-4-1',
    lessonId: 'lesson-4',
    contentType: 'text',
    contentValue: `# Händewaschen

Händewaschen ist ein wesentliches Verfahren zur Vorbeugung von nosokomialen Infektionen.

## Warum Hände waschen?

Händehygiene ist die wirksamste Maßnahme zur:
- Verhinderung der Übertragung von Infektionen
- Schutz der Patienten
- Schutz des Pflegepersonals
- Verringerung der Antibiotikaresistenz`,
    orderIndex: 1,
    createdAt: new Date('2025-01-15'),
  },
  {
    id: 'content-4-2',
    lessonId: 'lesson-4',
    contentType: 'video',
    contentValue: '/assets/videos/hand-washing-technique.mp4',
    orderIndex: 2,
    createdAt: new Date('2025-01-15'),
  },
  {
    id: 'content-4-3',
    lessonId: 'lesson-4',
    contentType: 'text',
    contentValue: `## Die 5 Momente der Händehygiene

1. **Vor Patientenkontakt**
2. **Vor aseptischen Tätigkeiten**
3. **Nach Kontakt mit potenziell infektiösem Material**
4. **Nach Patientenkontakt**
5. **Nach Kontakt mit der unmittelbaren Patientenumgebung**

## Waschtechnik

### Einfaches Waschen (40-60 Sekunden)
1. Hände befeuchten
2. Seife auftragen
3. Handfläche gegen Handfläche reiben
4. Handrücken reiben
5. Zwischen den Fingern reiben
6. Daumen reiben
7. Fingerspitzen reiben
8. Gründlich abspülen
9. Mit Einweghandtuch trocknen

### Händedesinfektion (20-30 Sekunden)
Gleiche Reibetechnik, aber mit alkoholischer Händedesinfektionslösung.

## Wichtige Punkte

- Schmuck und Uhr abnehmen
- Kurze und saubere Nägel
- Kein Nagellack
- Wunden abdecken
- Wasserhähne nicht mit sauberen Händen berühren`,
    orderIndex: 3,
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
    title: 'Quiz: Anatomische Terminologie',
    passingScore: 80,
    questionsCount: 10,
    timeLimitMinutes: 15,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'quiz-2',
    lessonId: 'lesson-3',
    title: 'Quiz: Das Skelettsystem',
    passingScore: 80,
    questionsCount: 10,
    timeLimitMinutes: 15,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'quiz-3',
    lessonId: 'lesson-4',
    title: 'Quiz: Händewaschen',
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
    questionText: 'Was ist die Referenzposition in der Anatomie?',
    type: 'qcm',
    explanation:
      'Die anatomische Referenzposition ist aufrecht stehend, dem Betrachter zugewandt, Arme entlang des Körpers, Handflächen nach vorne gedreht.',
    orderIndex: 1,
    points: 1,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'q1-2',
    quizId: 'quiz-1',
    questionText: 'Welche Ebene teilt den Körper in rechte und linke Teile?',
    type: 'qcm',
    explanation: 'Die Sagittalebene teilt den Körper in rechte und linke Teile.',
    orderIndex: 2,
    points: 1,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'q1-3',
    quizId: 'quiz-1',
    questionText: "Der Begriff 'anterior' bedeutet nach vorne zum Körper.",
    type: 'vrai_faux',
    explanation: "Anterior (oder ventral) bedeutet nach vorne zum Körper.",
    orderIndex: 3,
    points: 1,
    createdAt: new Date('2025-01-01'),
  },
  // Quiz 2 - Système squelettique
  {
    id: 'q2-1',
    quizId: 'quiz-2',
    questionText: "Wie viele Knochen hat das Skelett eines Erwachsenen?",
    type: 'qcm',
    explanation: 'Das erwachsene Skelett besteht aus 206 Knochen.',
    orderIndex: 1,
    points: 1,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'q2-2',
    quizId: 'quiz-2',
    questionText: 'Das Axialskelett umfasst:',
    type: 'qcm',
    explanation:
      'Das Axialskelett umfasst den Schädel, die Wirbelsäule und den Brustkorb (80 Knochen).',
    orderIndex: 2,
    points: 1,
    createdAt: new Date('2025-01-01'),
  },
  // Quiz 3 - Lavage des mains
  {
    id: 'q3-1',
    quizId: 'quiz-3',
    questionText: 'Wie lange ist die empfohlene Dauer für einfaches Händewaschen?',
    type: 'qcm',
    explanation:
      'Einfaches Händewaschen sollte 40 bis 60 Sekunden dauern, um wirksam zu sein.',
    orderIndex: 1,
    points: 1,
    createdAt: new Date('2025-01-15'),
  },
  {
    id: 'q3-2',
    quizId: 'quiz-3',
    questionText: "Händehygiene beugt nosokomialen Infektionen vor.",
    type: 'vrai_faux',
    explanation:
      "Händehygiene ist die wirksamste Maßnahme zur Vorbeugung nosokomialer Infektionen.",
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
    optionText: 'Auf dem Rücken liegend',
    isCorrect: false,
    orderIndex: 1,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'opt-q1-1-2',
    questionId: 'q1-1',
    optionText: 'Aufrecht stehend, Arme entlang des Körpers, Handflächen nach vorne',
    isCorrect: true,
    orderIndex: 2,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'opt-q1-1-3',
    questionId: 'q1-1',
    optionText: 'Sitzend mit gekreuzten Beinen',
    isCorrect: false,
    orderIndex: 3,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'opt-q1-1-4',
    questionId: 'q1-1',
    optionText: 'Stehend mit erhobenen Armen',
    isCorrect: false,
    orderIndex: 4,
    createdAt: new Date('2025-01-01'),
  },
  // Question q1-2 options
  {
    id: 'opt-q1-2-1',
    questionId: 'q1-2',
    optionText: 'Frontalebene',
    isCorrect: false,
    orderIndex: 1,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'opt-q1-2-2',
    questionId: 'q1-2',
    optionText: 'Sagittalebene',
    isCorrect: true,
    orderIndex: 2,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'opt-q1-2-3',
    questionId: 'q1-2',
    optionText: 'Transversalebene',
    isCorrect: false,
    orderIndex: 3,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'opt-q1-2-4',
    questionId: 'q1-2',
    optionText: 'Schräge Ebene',
    isCorrect: false,
    orderIndex: 4,
    createdAt: new Date('2025-01-01'),
  },
  // Question q1-3 options (True/False)
  {
    id: 'opt-q1-3-1',
    questionId: 'q1-3',
    optionText: 'Wahr',
    isCorrect: true,
    orderIndex: 1,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'opt-q1-3-2',
    questionId: 'q1-3',
    optionText: 'Falsch',
    isCorrect: false,
    orderIndex: 2,
    createdAt: new Date('2025-01-01'),
  },
  // Question q2-1 options
  {
    id: 'opt-q2-1-1',
    questionId: 'q2-1',
    optionText: '186 Knochen',
    isCorrect: false,
    orderIndex: 1,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'opt-q2-1-2',
    questionId: 'q2-1',
    optionText: '196 Knochen',
    isCorrect: false,
    orderIndex: 2,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'opt-q2-1-3',
    questionId: 'q2-1',
    optionText: '206 Knochen',
    isCorrect: true,
    orderIndex: 3,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'opt-q2-1-4',
    questionId: 'q2-1',
    optionText: '216 Knochen',
    isCorrect: false,
    orderIndex: 4,
    createdAt: new Date('2025-01-01'),
  },
  // Question q2-2 options
  {
    id: 'opt-q2-2-1',
    questionId: 'q2-2',
    optionText: 'Die oberen und unteren Extremitäten',
    isCorrect: false,
    orderIndex: 1,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'opt-q2-2-2',
    questionId: 'q2-2',
    optionText: 'Den Schädel, die Wirbelsäule und den Brustkorb',
    isCorrect: true,
    orderIndex: 2,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'opt-q2-2-3',
    questionId: 'q2-2',
    optionText: 'Nur die Armknochen',
    isCorrect: false,
    orderIndex: 3,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'opt-q2-2-4',
    questionId: 'q2-2',
    optionText: 'Nur die Beinknochen',
    isCorrect: false,
    orderIndex: 4,
    createdAt: new Date('2025-01-01'),
  },
  // Question q3-1 options
  {
    id: 'opt-q3-1-1',
    questionId: 'q3-1',
    optionText: '10-20 Sekunden',
    isCorrect: false,
    orderIndex: 1,
    createdAt: new Date('2025-01-15'),
  },
  {
    id: 'opt-q3-1-2',
    questionId: 'q3-1',
    optionText: '20-30 Sekunden',
    isCorrect: false,
    orderIndex: 2,
    createdAt: new Date('2025-01-15'),
  },
  {
    id: 'opt-q3-1-3',
    questionId: 'q3-1',
    optionText: '40-60 Sekunden',
    isCorrect: true,
    orderIndex: 3,
    createdAt: new Date('2025-01-15'),
  },
  {
    id: 'opt-q3-1-4',
    questionId: 'q3-1',
    optionText: '60-90 Sekunden',
    isCorrect: false,
    orderIndex: 4,
    createdAt: new Date('2025-01-15'),
  },
  // Question q3-2 options (True/False)
  {
    id: 'opt-q3-2-1',
    questionId: 'q3-2',
    optionText: 'Wahr',
    isCorrect: true,
    orderIndex: 1,
    createdAt: new Date('2025-01-15'),
  },
  {
    id: 'opt-q3-2-2',
    questionId: 'q3-2',
    optionText: 'Falsch',
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
