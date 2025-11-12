# Documentation Backend - Plateforme de Préparation Pflegefachfrau

## Vue d'ensemble

Cette documentation décrit l'architecture backend complète nécessaire pour la plateforme de formation Pflegefachfrau-Vorbereitung. Le backend est conçu en architecture microservices pour assurer la scalabilité, la maintenabilité et la séparation des responsabilités.

## Architecture des Microservices

Le système est composé de 7 microservices principaux :

1. **Service d'Authentification (Auth Service)**
2. **Service de Gestion des Utilisateurs (User Service)**
3. **Service de Gestion des Cours (Course Service)**
4. **Service de Progression (Progress Service)**
5. **Service de Quiz (Quiz Service)**
6. **Service de Contact (Contact Service)**
7. **Service de Gestion du Contenu (Content Management Service)**

---

## 1. Service d'Authentification (Auth Service)

### Rôle
Gère l'authentification et l'autorisation des utilisateurs, la création de sessions et la gestion des tokens JWT.

### Technologies recommandées
- Node.js avec Express.js ou NestJS
- JWT pour les tokens d'authentification
- bcrypt pour le hashing des mots de passe
- Base de données: PostgreSQL

### Endpoints

#### POST /api/auth/register
**Rôle**: Enregistrer un nouvel utilisateur dans le système

**Corps de la requête**:
```json
{
  "email": "string (required, format email)",
  "password": "string (required, min 6 caractères)",
  "firstName": "string (required, min 2 caractères)",
  "lastName": "string (required, min 2 caractères)",
  "aktenzeichen": "string (optional, max 8 caractères)"
}
```

**Réponse succès (201)**:
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "aktenzeichen": "string",
    "role": "student",
    "createdAt": "timestamp"
  },
  "token": "string (JWT)"
}
```

**Erreurs possibles**:
- 400: Email déjà utilisé
- 400: Données de validation invalides
- 500: Erreur serveur

---

#### POST /api/auth/login
**Rôle**: Authentifier un utilisateur existant

**Corps de la requête**:
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Réponse succès (200)**:
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "aktenzeichen": "string",
    "role": "string",
    "lastLoginAt": "timestamp"
  },
  "token": "string (JWT)"
}
```

**Erreurs possibles**:
- 401: Email ou mot de passe invalide
- 400: Données manquantes
- 500: Erreur serveur

---

#### POST /api/auth/logout
**Rôle**: Déconnecter l'utilisateur et invalider le token

**Headers requis**:
- Authorization: Bearer {token}

**Réponse succès (200)**:
```json
{
  "message": "Déconnexion réussie"
}
```

---

#### POST /api/auth/reset-password
**Rôle**: Initier la réinitialisation du mot de passe

**Corps de la requête**:
```json
{
  "email": "string (required)"
}
```

**Réponse succès (200)**:
```json
{
  "message": "Email de réinitialisation envoyé"
}
```

**Erreurs possibles**:
- 400: Email invalide
- 500: Erreur serveur

---

#### POST /api/auth/reset-password/confirm
**Rôle**: Confirmer la réinitialisation du mot de passe avec le token

**Corps de la requête**:
```json
{
  "token": "string (required)",
  "newPassword": "string (required, min 6 caractères)"
}
```

**Réponse succès (200)**:
```json
{
  "message": "Mot de passe réinitialisé avec succès"
}
```

---

#### GET /api/auth/verify
**Rôle**: Vérifier la validité du token JWT

**Headers requis**:
- Authorization: Bearer {token}

**Réponse succès (200)**:
```json
{
  "valid": true,
  "user": {
    "id": "string",
    "email": "string",
    "role": "string"
  }
}
```

---

## 2. Service de Gestion des Utilisateurs (User Service)

### Rôle
Gère les profils utilisateurs, leurs informations personnelles et leurs rôles.

### Technologies recommandées
- Node.js avec Express.js ou NestJS
- Base de données: PostgreSQL

### Endpoints

#### GET /api/users/me
**Rôle**: Récupérer le profil de l'utilisateur connecté

**Headers requis**:
- Authorization: Bearer {token}

**Réponse succès (200)**:
```json
{
  "id": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "aktenzeichen": "string",
  "avatarUrl": "string",
  "role": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "lastLoginAt": "timestamp"
}
```

---

#### PUT /api/users/me
**Rôle**: Mettre à jour le profil de l'utilisateur connecté

**Headers requis**:
- Authorization: Bearer {token}

**Corps de la requête**:
```json
{
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "avatarUrl": "string (optional)"
}
```

**Réponse succès (200)**:
```json
{
  "id": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "avatarUrl": "string",
  "updatedAt": "timestamp"
}
```

---

#### GET /api/users/:id
**Rôle**: Récupérer un utilisateur par ID (admin uniquement)

**Headers requis**:
- Authorization: Bearer {token}

**Paramètres**:
- id: string (ID de l'utilisateur)

**Réponse succès (200)**:
```json
{
  "id": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "string",
  "createdAt": "timestamp"
}
```

---

#### GET /api/users
**Rôle**: Lister tous les utilisateurs (admin/content_manager uniquement)

**Headers requis**:
- Authorization: Bearer {token}

**Query parameters**:
- page: number (default: 1)
- limit: number (default: 20)
- role: string (optional filter)

**Réponse succès (200)**:
```json
{
  "users": [
    {
      "id": "string",
      "email": "string",
      "firstName": "string",
      "lastName": "string",
      "role": "string",
      "createdAt": "timestamp"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## 3. Service de Gestion des Cours (Course Service)

### Rôle
Gère les cours, les leçons, et le contenu pédagogique.

### Technologies recommandées
- Node.js avec Express.js ou NestJS
- Base de données: PostgreSQL
- Storage: AWS S3 ou équivalent pour les fichiers média

### Endpoints

#### GET /api/courses
**Rôle**: Récupérer la liste de tous les cours

**Query parameters**:
- level: string (optional: beginner, intermediate, advanced)
- page: number (default: 1)
- limit: number (default: 10)

**Réponse succès (200)**:
```json
{
  "courses": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "thumbnailUrl": "string",
      "level": "string",
      "durationMinutes": number,
      "lessonsCount": number,
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

#### GET /api/courses/:id
**Rôle**: Récupérer les détails d'un cours spécifique

**Paramètres**:
- id: string (ID du cours)

**Réponse succès (200)**:
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "thumbnailUrl": "string",
  "level": "string",
  "durationMinutes": number,
  "lessonsCount": number,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

#### POST /api/courses
**Rôle**: Créer un nouveau cours (content_manager/admin uniquement)

**Headers requis**:
- Authorization: Bearer {token}

**Corps de la requête**:
```json
{
  "title": "string (required)",
  "description": "string (required)",
  "thumbnailUrl": "string (optional)",
  "level": "string (required: beginner|intermediate|advanced)",
  "durationMinutes": number (required)
}
```

**Réponse succès (201)**:
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "level": "string",
  "createdAt": "timestamp"
}
```

---

#### PUT /api/courses/:id
**Rôle**: Mettre à jour un cours existant (content_manager/admin uniquement)

**Headers requis**:
- Authorization: Bearer {token}

**Paramètres**:
- id: string (ID du cours)

**Corps de la requête**:
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "thumbnailUrl": "string (optional)",
  "level": "string (optional)",
  "durationMinutes": number (optional)
}
```

**Réponse succès (200)**:
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "updatedAt": "timestamp"
}
```

---

#### DELETE /api/courses/:id
**Rôle**: Supprimer un cours (admin uniquement)

**Headers requis**:
- Authorization: Bearer {token}

**Paramètres**:
- id: string (ID du cours)

**Réponse succès (204)**:
No content

---

#### GET /api/courses/:courseId/lessons
**Rôle**: Récupérer toutes les leçons d'un cours

**Paramètres**:
- courseId: string (ID du cours)

**Réponse succès (200)**:
```json
{
  "lessons": [
    {
      "id": "string",
      "courseId": "string",
      "title": "string",
      "description": "string",
      "durationMinutes": number,
      "orderIndex": number,
      "createdAt": "timestamp"
    }
  ]
}
```

---

#### GET /api/lessons/:id
**Rôle**: Récupérer les détails d'une leçon spécifique

**Paramètres**:
- id: string (ID de la leçon)

**Réponse succès (200)**:
```json
{
  "id": "string",
  "courseId": "string",
  "title": "string",
  "description": "string",
  "durationMinutes": number,
  "orderIndex": number,
  "createdAt": "timestamp"
}
```

---

#### POST /api/courses/:courseId/lessons
**Rôle**: Créer une nouvelle leçon dans un cours (content_manager/admin uniquement)

**Headers requis**:
- Authorization: Bearer {token}

**Paramètres**:
- courseId: string (ID du cours)

**Corps de la requête**:
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "durationMinutes": number (required),
  "orderIndex": number (required)
}
```

**Réponse succès (201)**:
```json
{
  "id": "string",
  "courseId": "string",
  "title": "string",
  "orderIndex": number,
  "createdAt": "timestamp"
}
```

---

#### PUT /api/lessons/:id
**Rôle**: Mettre à jour une leçon existante (content_manager/admin uniquement)

**Headers requis**:
- Authorization: Bearer {token}

**Paramètres**:
- id: string (ID de la leçon)

**Corps de la requête**:
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "durationMinutes": number (optional)",
  "orderIndex": number (optional)"
}
```

**Réponse succès (200)**:
```json
{
  "id": "string",
  "title": "string",
  "updatedAt": "timestamp"
}
```

---

#### DELETE /api/lessons/:id
**Rôle**: Supprimer une leçon (admin uniquement)

**Headers requis**:
- Authorization: Bearer {token}

**Paramètres**:
- id: string (ID de la leçon)

**Réponse succès (204)**:
No content

---

#### GET /api/lessons/:lessonId/contents
**Rôle**: Récupérer tous les contenus d'une leçon

**Paramètres**:
- lessonId: string (ID de la leçon)

**Réponse succès (200)**:
```json
{
  "contents": [
    {
      "id": "string",
      "lessonId": "string",
      "contentType": "string (text|video|image)",
      "contentValue": "string",
      "orderIndex": number,
      "createdAt": "timestamp"
    }
  ]
}
```

---

#### POST /api/lessons/:lessonId/contents
**Rôle**: Ajouter du contenu à une leçon (content_manager/admin uniquement)

**Headers requis**:
- Authorization: Bearer {token}

**Paramètres**:
- lessonId: string (ID de la leçon)

**Corps de la requête**:
```json
{
  "contentType": "string (required: text|video|image)",
  "contentValue": "string (required)",
  "orderIndex": number (required)
}
```

**Réponse succès (201)**:
```json
{
  "id": "string",
  "lessonId": "string",
  "contentType": "string",
  "orderIndex": number,
  "createdAt": "timestamp"
}
```

---

#### PUT /api/contents/:id
**Rôle**: Mettre à jour un contenu de leçon (content_manager/admin uniquement)

**Headers requis**:
- Authorization: Bearer {token}

**Paramètres**:
- id: string (ID du contenu)

**Corps de la requête**:
```json
{
  "contentValue": "string (optional)",
  "orderIndex": number (optional)"
}
```

**Réponse succès (200)**:
```json
{
  "id": "string",
  "contentValue": "string",
  "updatedAt": "timestamp"
}
```

---

#### DELETE /api/contents/:id
**Rôle**: Supprimer un contenu de leçon (admin uniquement)

**Headers requis**:
- Authorization: Bearer {token}

**Paramètres**:
- id: string (ID du contenu)

**Réponse succès (204)**:
No content

---

## 4. Service de Progression (Progress Service)

### Rôle
Gère la progression des utilisateurs dans les cours et les leçons, ainsi que les inscriptions aux cours.

### Technologies recommandées
- Node.js avec Express.js ou NestJS
- Base de données: PostgreSQL

### Endpoints

#### GET /api/progress/courses/:courseId
**Rôle**: Récupérer la progression de l'utilisateur pour un cours spécifique

**Headers requis**:
- Authorization: Bearer {token}

**Paramètres**:
- courseId: string (ID du cours)

**Réponse succès (200)**:
```json
{
  "courseId": "string",
  "progress": number (0-100),
  "completedLessons": number,
  "totalLessons": number,
  "lastAccessedLessonId": "string"
}
```

---

#### GET /api/progress/lessons/:lessonId
**Rôle**: Récupérer la progression de l'utilisateur pour une leçon spécifique

**Headers requis**:
- Authorization: Bearer {token}

**Paramètres**:
- lessonId: string (ID de la leçon)

**Réponse succès (200)**:
```json
{
  "id": "string",
  "userId": "string",
  "lessonId": "string",
  "isCompleted": boolean,
  "bestScore": number,
  "attemptCount": number,
  "timeSpentMinutes": number,
  "lastAttemptAt": "timestamp",
  "completedAt": "timestamp"
}
```

---

#### POST /api/progress/lessons/:lessonId/complete
**Rôle**: Marquer une leçon comme complétée

**Headers requis**:
- Authorization: Bearer {token}

**Paramètres**:
- lessonId: string (ID de la leçon)

**Réponse succès (200)**:
```json
{
  "id": "string",
  "lessonId": "string",
  "isCompleted": true,
  "completedAt": "timestamp"
}
```

---

#### PUT /api/progress/lessons/:lessonId/access
**Rôle**: Mettre à jour le dernier accès à une leçon

**Headers requis**:
- Authorization: Bearer {token}

**Paramètres**:
- lessonId: string (ID de la leçon)

**Réponse succès (200)**:
```json
{
  "lessonId": "string",
  "updatedAt": "timestamp"
}
```

---

#### POST /api/enrollments/courses/:courseId
**Rôle**: Inscrire l'utilisateur à un cours

**Headers requis**:
- Authorization: Bearer {token}

**Paramètres**:
- courseId: string (ID du cours)

**Réponse succès (201)**:
```json
{
  "id": "string",
  "userId": "string",
  "courseId": "string",
  "enrolledAt": "timestamp"
}
```

---

#### GET /api/enrollments/my-courses
**Rôle**: Récupérer tous les cours auxquels l'utilisateur est inscrit avec leur progression

**Headers requis**:
- Authorization: Bearer {token}

**Réponse succès (200)**:
```json
{
  "enrollments": [
    {
      "course": {
        "id": "string",
        "title": "string",
        "description": "string",
        "thumbnailUrl": "string",
        "level": "string",
        "lessonsCount": number
      },
      "enrollment": {
        "id": "string",
        "enrolledAt": "timestamp",
        "lastAccessedAt": "timestamp"
      },
      "progress": {
        "progressPercentage": number,
        "completedLessons": number,
        "totalLessons": number
      }
    }
  ]
}
```

---

#### DELETE /api/enrollments/courses/:courseId
**Rôle**: Désinscrire l'utilisateur d'un cours

**Headers requis**:
- Authorization: Bearer {token}

**Paramètres**:
- courseId: string (ID du cours)

**Réponse succès (204)**:
No content

---

#### GET /api/progress/reset
**Rôle**: Réinitialiser toute la progression de l'utilisateur (pour test/développement)

**Headers requis**:
- Authorization: Bearer {token}

**Réponse succès (200)**:
```json
{
  "message": "Progression réinitialisée avec succès"
}
```

---

## 5. Service de Quiz (Quiz Service)

### Rôle
Gère les quiz, les questions, les options de réponse, et les tentatives des utilisateurs.

### Technologies recommandées
- Node.js avec Express.js ou NestJS
- Base de données: PostgreSQL

### Endpoints

#### GET /api/quizzes/lesson/:lessonId
**Rôle**: Récupérer le quiz associé à une leçon

**Paramètres**:
- lessonId: string (ID de la leçon)

**Réponse succès (200)**:
```json
{
  "id": "string",
  "lessonId": "string",
  "title": "string",
  "passingScore": number,
  "questionsCount": number,
  "timeLimitMinutes": number,
  "createdAt": "timestamp"
}
```

---

#### GET /api/quizzes/:quizId
**Rôle**: Récupérer les détails d'un quiz

**Paramètres**:
- quizId: string (ID du quiz)

**Réponse succès (200)**:
```json
{
  "id": "string",
  "lessonId": "string",
  "title": "string",
  "passingScore": number,
  "questionsCount": number,
  "timeLimitMinutes": number,
  "createdAt": "timestamp"
}
```

---

#### POST /api/quizzes
**Rôle**: Créer un nouveau quiz pour une leçon (content_manager/admin uniquement)

**Headers requis**:
- Authorization: Bearer {token}

**Corps de la requête**:
```json
{
  "lessonId": "string (required)",
  "title": "string (required)",
  "passingScore": number (required, 0-100, default: 70),
  "timeLimitMinutes": number (optional)
}
```

**Réponse succès (201)**:
```json
{
  "id": "string",
  "lessonId": "string",
  "title": "string",
  "passingScore": number,
  "createdAt": "timestamp"
}
```

---

#### GET /api/quizzes/:quizId/questions
**Rôle**: Récupérer toutes les questions d'un quiz avec leurs options

**Paramètres**:
- quizId: string (ID du quiz)

**Réponse succès (200)**:
```json
{
  "questions": [
    {
      "id": "string",
      "quizId": "string",
      "questionText": "string",
      "type": "string (qcm|vrai_faux|qcm_multiple)",
      "explanation": "string",
      "orderIndex": number,
      "points": number,
      "options": [
        {
          "id": "string",
          "questionId": "string",
          "optionText": "string",
          "isCorrect": boolean,
          "orderIndex": number
        }
      ]
    }
  ]
}
```

---

#### POST /api/quizzes/:quizId/questions
**Rôle**: Ajouter une question à un quiz (content_manager/admin uniquement)

**Headers requis**:
- Authorization: Bearer {token}

**Paramètres**:
- quizId: string (ID du quiz)

**Corps de la requête**:
```json
{
  "questionText": "string (required)",
  "type": "string (required: qcm|vrai_faux|qcm_multiple)",
  "explanation": "string (required)",
  "orderIndex": number (required),
  "points": number (default: 1)"
}
```

**Réponse succès (201)**:
```json
{
  "id": "string",
  "quizId": "string",
  "questionText": "string",
  "type": "string",
  "createdAt": "timestamp"
}
```

---

#### POST /api/questions/:questionId/options
**Rôle**: Ajouter une option de réponse à une question (content_manager/admin uniquement)

**Headers requis**:
- Authorization: Bearer {token}

**Paramètres**:
- questionId: string (ID de la question)

**Corps de la requête**:
```json
{
  "optionText": "string (required)",
  "isCorrect": boolean (required),
  "orderIndex": number (required)"
}
```

**Réponse succès (201)**:
```json
{
  "id": "string",
  "questionId": "string",
  "optionText": "string",
  "isCorrect": boolean,
  "createdAt": "timestamp"
}
```

---

#### POST /api/quizzes/:quizId/attempts
**Rôle**: Soumettre une tentative de quiz et calculer le score

**Headers requis**:
- Authorization: Bearer {token}

**Paramètres**:
- quizId: string (ID du quiz)

**Corps de la requête**:
```json
{
  "lessonId": "string (required)",
  "answers": [
    {
      "questionId": "string",
      "selectedOptionIds": ["string"]
    }
  ]
}
```

**Réponse succès (201)**:
```json
{
  "id": "string",
  "userId": "string",
  "quizId": "string",
  "lessonId": "string",
  "score": number,
  "passed": boolean,
  "attemptNumber": number,
  "answers": [
    {
      "questionId": "string",
      "selectedOptions": ["string"],
      "isCorrect": boolean
    }
  ],
  "completedAt": "timestamp"
}
```

---

#### GET /api/quizzes/:quizId/attempts
**Rôle**: Récupérer toutes les tentatives d'un utilisateur pour un quiz

**Headers requis**:
- Authorization: Bearer {token}

**Paramètres**:
- quizId: string (ID du quiz)

**Réponse succès (200)**:
```json
{
  "attempts": [
    {
      "id": "string",
      "quizId": "string",
      "score": number,
      "passed": boolean,
      "attemptNumber": number,
      "completedAt": "timestamp"
    }
  ]
}
```

---

#### PUT /api/questions/:id
**Rôle**: Mettre à jour une question (content_manager/admin uniquement)

**Headers requis**:
- Authorization: Bearer {token}

**Paramètres**:
- id: string (ID de la question)

**Corps de la requête**:
```json
{
  "questionText": "string (optional)",
  "explanation": "string (optional)",
  "orderIndex": number (optional)"
}
```

**Réponse succès (200)**:
```json
{
  "id": "string",
  "questionText": "string",
  "updatedAt": "timestamp"
}
```

---

#### DELETE /api/questions/:id
**Rôle**: Supprimer une question (admin uniquement)

**Headers requis**:
- Authorization: Bearer {token}

**Paramètres**:
- id: string (ID de la question)

**Réponse succès (204)**:
No content

---

## 6. Service de Contact (Contact Service)

### Rôle
Gère les messages de contact des utilisateurs et des entreprises.

### Technologies recommandées
- Node.js avec Express.js ou NestJS
- Service d'email: SendGrid, AWS SES, ou Nodemailer
- Base de données: PostgreSQL

### Endpoints

#### POST /api/contact
**Rôle**: Soumettre un message de contact

**Corps de la requête**:
```json
{
  "name": "string (required)",
  "email": "string (required, format email)",
  "message": "string (required)",
  "isBusiness": boolean (default: false),
  "address": {
    "street": "string (required if isBusiness)",
    "houseNumber": "string (required if isBusiness)",
    "city": "string (required if isBusiness)",
    "postalCode": "string (required if isBusiness)"
  }
}
```

**Réponse succès (200)**:
```json
{
  "success": true,
  "message": "Votre message a été envoyé avec succès"
}
```

**Erreurs possibles**:
- 400: Données de validation invalides
- 500: Erreur lors de l'envoi de l'email

---

#### GET /api/contact/messages
**Rôle**: Récupérer tous les messages de contact (admin uniquement)

**Headers requis**:
- Authorization: Bearer {token}

**Query parameters**:
- page: number (default: 1)
- limit: number (default: 20)
- isBusiness: boolean (optional filter)

**Réponse succès (200)**:
```json
{
  "messages": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "message": "string",
      "isBusiness": boolean,
      "address": {
        "street": "string",
        "houseNumber": "string",
        "city": "string",
        "postalCode": "string"
      },
      "createdAt": "timestamp",
      "isRead": boolean
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

---

#### PATCH /api/contact/messages/:id/read
**Rôle**: Marquer un message comme lu (admin uniquement)

**Headers requis**:
- Authorization: Bearer {token}

**Paramètres**:
- id: string (ID du message)

**Réponse succès (200)**:
```json
{
  "id": "string",
  "isRead": true,
  "readAt": "timestamp"
}
```

---

## 7. Service de Gestion du Contenu (Content Management Service)

### Rôle
Gère le téléchargement, le stockage et la distribution des fichiers média (images, vidéos).

### Technologies recommandées
- Node.js avec Express.js ou NestJS
- Storage: AWS S3, Google Cloud Storage, ou Azure Blob Storage
- CDN: CloudFront, Cloudflare

### Endpoints

#### POST /api/media/upload
**Rôle**: Télécharger un fichier média (content_manager/admin uniquement)

**Headers requis**:
- Authorization: Bearer {token}
- Content-Type: multipart/form-data

**Corps de la requête**:
- file: File (required)
- type: string (image|video)

**Réponse succès (201)**:
```json
{
  "url": "string (URL publique du fichier)",
  "filename": "string",
  "type": "string",
  "size": number,
  "uploadedAt": "timestamp"
}
```

---

#### DELETE /api/media/:filename
**Rôle**: Supprimer un fichier média (admin uniquement)

**Headers requis**:
- Authorization: Bearer {token}

**Paramètres**:
- filename: string (nom du fichier)

**Réponse succès (204)**:
No content

---

#### GET /api/media
**Rôle**: Lister tous les fichiers média (content_manager/admin uniquement)

**Headers requis**:
- Authorization: Bearer {token}

**Query parameters**:
- type: string (optional: image|video)
- page: number (default: 1)
- limit: number (default: 50)

**Réponse succès (200)**:
```json
{
  "files": [
    {
      "url": "string",
      "filename": "string",
      "type": "string",
      "size": number,
      "uploadedAt": "timestamp"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 200,
    "totalPages": 4
  }
}
```

---

## Schéma de Base de Données

### Table: users
```sql
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url VARCHAR(500),
  aktenzeichen VARCHAR(8),
  role VARCHAR(20) DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);
```

### Table: courses
```sql
CREATE TABLE courses (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  thumbnail_url VARCHAR(500),
  level VARCHAR(20) NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  lessons_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: lessons
```sql
CREATE TABLE lessons (
  id VARCHAR(50) PRIMARY KEY,
  course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: lesson_contents
```sql
CREATE TABLE lesson_contents (
  id VARCHAR(50) PRIMARY KEY,
  lesson_id VARCHAR(50) NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  content_type VARCHAR(20) NOT NULL,
  content_value TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: quizzes
```sql
CREATE TABLE quizzes (
  id VARCHAR(50) PRIMARY KEY,
  lesson_id VARCHAR(50) UNIQUE NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  passing_score INTEGER NOT NULL DEFAULT 70,
  questions_count INTEGER NOT NULL DEFAULT 0,
  time_limit_minutes INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: questions
```sql
CREATE TABLE questions (
  id VARCHAR(50) PRIMARY KEY,
  quiz_id VARCHAR(50) NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  type VARCHAR(20) NOT NULL,
  explanation TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  points INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: quiz_options
```sql
CREATE TABLE quiz_options (
  id VARCHAR(50) PRIMARY KEY,
  question_id VARCHAR(50) NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: user_course_enrollments
```sql
CREATE TABLE user_course_enrollments (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_accessed_at TIMESTAMP,
  UNIQUE(user_id, course_id)
);
```

### Table: user_progress
```sql
CREATE TABLE user_progress (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
  lesson_id VARCHAR(50) NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  best_score INTEGER DEFAULT 0,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  time_spent_minutes INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, lesson_id)
);
```

### Table: user_quiz_attempts
```sql
CREATE TABLE user_quiz_attempts (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
  quiz_id VARCHAR(50) NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  lesson_id VARCHAR(50) NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT FALSE,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  time_taken_minutes INTEGER,
  answers JSONB NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: contact_messages
```sql
CREATE TABLE contact_messages (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_business BOOLEAN DEFAULT FALSE,
  street VARCHAR(255),
  house_number VARCHAR(50),
  city VARCHAR(255),
  postal_code VARCHAR(10),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Authentification et Sécurité

### JWT (JSON Web Tokens)
- Tous les endpoints protégés nécessitent un token JWT dans le header `Authorization: Bearer {token}`
- Les tokens doivent contenir: `userId`, `email`, `role`
- Durée de validité recommandée: 24 heures
- Les tokens de rafraîchissement (refresh tokens) doivent avoir une durée de 30 jours

### Contrôle d'accès basé sur les rôles (RBAC)

#### Rôle: student
- Accès en lecture aux cours et leçons
- Inscription aux cours
- Soumission de quiz
- Mise à jour de son propre profil
- Accès à sa propre progression

#### Rôle: content_manager
- Tous les droits du rôle student
- Création et modification de cours, leçons, quiz
- Téléchargement de fichiers média
- Visualisation des messages de contact

#### Rôle: admin
- Tous les droits du rôle content_manager
- Suppression de cours, leçons, quiz
- Gestion des utilisateurs
- Suppression de fichiers média
- Gestion des messages de contact

---

## Configuration et Déploiement

### Variables d'environnement recommandées

```env
# Base de données
DATABASE_URL=postgresql://user:password@host:5432/dbname
DATABASE_POOL_SIZE=20

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=24h
JWT_REFRESH_EXPIRATION=30d

# Email
EMAIL_SERVICE=sendgrid
EMAIL_API_KEY=your-api-key
EMAIL_FROM=noreply@pflegefrau-vorbereitung.de

# Storage
STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BUCKET_NAME=pflegefrau-media
AWS_REGION=eu-central-1

# Application
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://pflegefrau-vorbereitung.de
```

---

## Recommandations Techniques

### Performance
- Implémenter un système de cache (Redis) pour les requêtes fréquentes (cours, leçons)
- Utiliser la pagination pour toutes les listes
- Optimiser les requêtes avec des index sur les clés étrangères
- Utiliser un CDN pour servir les fichiers statiques et média

### Monitoring
- Implémenter des logs structurés (Winston, Bunyan)
- Utiliser un service de monitoring (DataDog, New Relic)
- Configurer des alertes pour les erreurs critiques
- Tracker les métriques de performance des API

### Tests
- Tests unitaires pour la logique métier (Jest)
- Tests d'intégration pour les endpoints API
- Tests end-to-end pour les flux critiques
- Couverture de code minimale: 80%

### Documentation
- Utiliser Swagger/OpenAPI pour documenter les API
- Maintenir des exemples de requêtes/réponses à jour
- Documenter les codes d'erreur et leurs significations

---

## Conclusion

Cette documentation fournit une base complète pour l'implémentation du backend de la plateforme Pflegefachfrau-Vorbereitung. Une fois les API implémentées selon ces spécifications, le frontend pourra être facilement adapté pour consommer ces services en remplaçant les services mock actuels par des appels HTTP réels.

Pour toute question ou clarification, veuillez contacter l'équipe de développement.
