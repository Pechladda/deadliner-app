# Deadliner

> Never miss a deadline again.

Deadliner is a student deadline tracking app that helps you visualize urgency and stay on top of assignments. Built with React Native and Expo, it runs on iOS, Android, and web with real-time Firebase sync.

🌐 **Live web app:** [https://deadliner-90803.web.app](https://deadliner-90803.web.app)

---

## Features

- **Deadline Tracking** — Add deadlines with course name, assignment name, due date and time
- **Urgency Visualization** — Color-coded status system (On Track → Soon → Urgent → Overdue) so you see what needs attention at a glance
- **Smart Filtering** — Filter deadlines by All, Overdue, Urgent, Soon, or On Track
- **Search** — Quickly find any deadline by name
- **Reminders** — Schedule local notifications 5 minutes, 30 minutes, 1 hour, or 1 day before a deadline
- **Swipe Gestures** — Swipe left on a deadline card to reveal actions (mark done, edit, delete)
- **History** — View and manage completed deadlines
- **Firebase Sync** — Deadlines are stored in Firestore per user and synced across devices
- **Authentication** — Sign up, log in, and reset password via Firebase Auth
- **Settings** — Toggle notifications on/off, manage account, view privacy policy
- **Responsive Layout** — Adapts to iPhone, iPad, and browser window sizes

---

## Tech Stack

| Layer            | Technology                                       |
| ---------------- | ------------------------------------------------ |
| Framework        | [Expo](https://expo.dev) ~54 / React Native 0.81 |
| Language         | TypeScript                                       |
| State Management | [Zustand](https://github.com/pmndrs/zustand) v5  |
| Backend          | Firebase (Firestore + Auth)                      |
| Notifications    | expo-notifications (iOS & Android only)          |
| Navigation       | React Navigation v7                              |
| UI               | Custom component system + Ionicons               |
| Web Hosting      | Firebase Hosting                                 |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator / Android Emulator, or a physical device with Expo Go

### Install

```bash
git clone https://github.com/Pechladda/deadliner-app.git
cd deadliner-app
npm install
```

### Environment

Copy `.env.example` to `.env` and fill in your Firebase config:

```bash
cp .env.example .env
```

```env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

### Run

```bash
# Start Expo dev server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run in browser (web)
npm run web
```

---

## Deployment (Web)

The app is exported as a static site and hosted on Firebase Hosting.

```bash
# Build the web export
npm run export:web

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

The landing page lives at `/public/landing-page/index.html` and is served at `/landing-page` via Firebase Hosting rewrites.

---

## Project Structure

```
deadliner-app/
├── App.tsx                     # App entry point
├── app.json                    # Expo config
├── firebase.json               # Firebase Hosting config (rewrites, public dir)
├── public/
│   └── landing-page/
│       └── index.html          # Marketing landing page
├── src/
│   ├── components/             # Shared UI components (AppButton, AppText, Toast, ...)
│   ├── core/
│   │   ├── config/             # App metadata and constants
│   │   ├── navigation/         # React Navigation setup
│   │   └── utils/              # Deadline utilities, Firebase error helpers
│   ├── features/
│   │   ├── add-deadline/       # Add deadline screen
│   │   ├── deadline-detail/    # Deadline detail and edit screen
│   │   ├── home-deadline-list/ # Home screen with list and filters
│   │   ├── login/              # Login, register, forgot password
│   │   ├── settings/           # Settings, profile, history, privacy policy
│   │   └── shared/             # Shared feature components (DeadlineCard)
│   ├── models/                 # TypeScript types (deadline.ts, ...)
│   ├── services/
│   │   ├── deadline-service.ts         # Firestore CRUD
│   │   ├── notification-service.ts     # Local notifications (iOS/Android)
│   │   └── notification-service.web.ts # Web stub (no-op, avoids import errors)
│   ├── store/                  # Zustand stores (auth-store, deadline-store)
│   └── theme/                  # Colors, typography, spacing, layout
└── assets/                     # Fonts and images
```

---

## Deadline Status Colors

| Status   | Color               | Condition                    |
| -------- | ------------------- | ---------------------------- |
| On Track | 🟢 Green `#05e317`  | More than 3 days remaining   |
| Soon     | 🟡 Yellow `#fce514` | 1–3 days remaining           |
| Urgent   | 🔴 Red `#f80834`    | Less than 24 hours remaining |
| Overdue  | ⚫ Grey `#6C757D`   | Past due date                |

---

## Notifications

Notifications are scheduled locally on the device using `expo-notifications` (iOS and Android only — not supported on web). Supported reminder intervals:

- 5 minutes before
- 30 minutes before
- 1 hour before
- 1 day before

Notifications are automatically cancelled when a deadline is completed or deleted, and rescheduled when a deadline is restored from history.

---

## Firebase Data Structure

Each user's deadlines are stored in a private subcollection, isolated by user ID:

```
users/
  {uid}/
    deadlines/
      {deadlineId}/
        assignmentName: string
        courseName: string
        dueAt: Timestamp
        colorStatus: string   # snapshot at save time; urgency recalculated at runtime
        notificationId: string | null
        createdAt: Timestamp
```

Firestore security rules ensure users can only read and write their own data.

---

## Author

**Maymae (Pechladda Duangkaew)**

---

## Version

v1.1.0
