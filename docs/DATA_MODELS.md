# Data Models and Services Documentation

This document describes the complete data model structure and services for the medical education platform.

## Overview

The platform uses a hierarchical structure:
- **Modules** contain **Chapters**
- **Chapters** contain **Lessons**
- **Lessons** can have optional **Quizzes**
- **User Progress** tracks completion and scores

## Models Location

All models are located in `src/app/models/`:
- `course.model.ts` - Course structure interfaces
- `progress.model.ts` - User progress tracking interfaces
- `index.ts` - Barrel export file

## Service Location

The CourseService is located in `src/app/core/services/`:
- `course.service.ts` - Main service implementation
- `course.service.spec.ts` - Unit tests
- `index.ts` - Barrel export file

## Quick Start

```typescript
import { CourseService } from '@app/core/services';
import { Module, UserProgress } from '@app/models';

// In your component
private courseService = inject(CourseService);

// Get all modules
this.courseService.getAllModules().subscribe(modules => {
  console.log(modules);
});

// Mark lesson as completed
this.courseService.markLessonCompleted('lesson-1').subscribe();

// Track progress
this.courseService.getUserProgress().subscribe(progress => {
  console.log('Progress:', progress.totalProgress + '%');
});
```

For detailed documentation, see the inline comments in the model and service files.
