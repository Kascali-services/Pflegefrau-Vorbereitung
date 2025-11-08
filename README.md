# Pflegefachfrau Vorbereitung

Eine moderne Angular-Webanwendung zur Vorbereitung auf die Ausbildung zur Pflegefachfrau in Deutschland.

## 📋 Projektbeschreibung

Diese Plattform bietet:
- 📚 Strukturierte Kurse zu verschiedenen Pflegethemen
- ✍️ Interaktive Quiz zur Wissensüberprüfung
- 📊 Fortschrittsverfolgung
- 🎨 Modernes, benutzerfreundliches Material Design Interface

## 🚀 Technologie-Stack

- **Framework**: Angular 19.2.x
- **UI Library**: Angular Material
- **Styling**: SCSS
- **Node.js**: 20.x oder höher
- **TypeScript**: Strict Mode aktiviert
- **Linting**: ESLint
- **Code Formatting**: Prettier

## 📁 Projektstruktur

```
src/
├── app/
│   ├── core/              # Singleton Services, Guards, Interceptors
│   ├── shared/            # Wiederverwendbare Komponenten, Direktiven, Pipes
│   ├── features/          # Feature-Module
│   │   ├── home/          # Startseite
│   │   ├── courses/       # Kursverwaltung
│   │   ├── quiz/          # Quiz-Funktionalität
│   │   └── progress/      # Fortschrittsverfolgung
│   ├── models/            # TypeScript Interfaces und Types
│   └── app.routes.ts      # Routing-Konfiguration
├── assets/                # Statische Assets
└── environments/          # Umgebungskonfigurationen
```

## 🛠️ Installation

### Voraussetzungen

- Node.js (Version 20.x oder höher)
- npm (normalerweise mit Node.js installiert)
- Angular CLI (wird global installiert)

### Schritte

1. **Repository klonen**
   ```bash
   git clone https://github.com/Kascali-services/Pflegefrau-Vorbereitung.git
   cd Pflegefrau-Vorbereitung
   ```

2. **Dependencies installieren**
   ```bash
   npm install
   ```

3. **Entwicklungsserver starten**
   ```bash
   npm start
   # oder
   ng serve
   ```

4. **Anwendung im Browser öffnen**
   ```
   http://localhost:4200/
   ```

## 📝 Verfügbare Befehle

| Befehl | Beschreibung |
|--------|--------------|
| `npm start` | Startet den Entwicklungsserver |
| `npm run build` | Erstellt einen Production Build |
| `npm test` | Führt Unit Tests aus |
| `npm run lint` | Führt ESLint aus |
| `npm run format` | Formatiert Code mit Prettier |

## 🧪 Testing

Tests ausführen:
```bash
npm test
```

## 🏗️ Build

Production Build erstellen:
```bash
npm run build
```

Die Build-Artefakte werden im `dist/` Verzeichnis gespeichert.

## 🎨 Theme

Die Anwendung verwendet ein benutzerdefiniertes Angular Material Theme mit medizinischen Farben:
- **Primary**: Medical Blue (#2196f3)
- **Accent**: Medical Green (#4caf50)
- **Warn**: Red (Material Standard)

## 🔐 Umgebungskonfigurationen

Das Projekt unterstützt verschiedene Umgebungen:

- **Development** (`src/environments/environment.ts`)
- **Production** (`src/environments/environment.prod.ts`)

Die Umgebungsdateien enthalten:
- `production`: Boolean Flag
- `apiUrl`: Backend-API URL (wird bei FastAPI-Integration konfiguriert)

## 🚦 Routing

Die Anwendung verwendet Lazy Loading für optimale Performance:

- `/` → Home (Startseite)
- `/courses` → Kursübersicht
- `/courses/:id` → Kursdetails

## 🔮 Zukünftige Features

- ⚡ FastAPI Backend-Integration
- 🔐 JWT-Authentifizierung
- 🤖 KI-gestützte Interaktionen
- �� Progressive Web App (PWA)
- 🌐 Mehrsprachigkeit

## 👥 Entwicklung

### Code-Qualität

Das Projekt verwendet strenge TypeScript-Einstellungen und ESLint für hohe Code-Qualität.

### Komponenten generieren

```bash
ng generate component features/[feature-name]/[component-name] --standalone
```

### Services generieren

```bash
ng generate service core/services/[service-name]
```

## 📄 Lizenz

Dieses Projekt ist privat und für Bildungszwecke.

## 🤝 Beitragen

Dieses Projekt wird aktiv entwickelt. Für Fragen oder Vorschläge, bitte ein Issue erstellen.

---

**Sprint 1, Ticket PFLEG-1** ✅
