# Deadliner

> Never miss a deadline again.

Deadliner is a mobile app that helps students visualize deadline urgency and stay on top of their assignments. Built with React Native and Expo, it runs on iOS and Android with real-time Firebase sync.

---

## Features

- **Deadline Tracking** — Add deadlines with course name, assignment name, due date and time
- **Urgency Visualization** — Color-coded status system (On Track → Soon → Urgent → Overdue) so you see what needs attention at a glance
- **Smart Filtering** — Filter deadlines by All, Overdue, Urgent, Soon, or On Track
- **Search** — Quickly find any deadline by name
- **Reminders** — Schedule local notifications 5 minutes, 30 minutes, 1 hour, or 1 day before a deadline
- **Swipe Gestures** — Swipe right to complete, swipe left to delete
- **History** — View and manage completed deadlines
- **Firebase Sync** — Deadlines are stored in Firestore and synced across devices
- **Authentication** — Sign up, log in, and reset password via Firebase Auth
- **Settings** — Toggle notifications on/off, manage account and privacy

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Expo](https://expo.dev) ~54 / React Native 0.81 |
| Language | TypeScript |
| State Management | [Zustand](https://github.com/pmndrs/zustand) v5 |
| Backend | Firebase (Firestore + Auth) |
| Notifications | expo-notifications |
| Navigation | React Navigation v7 |
| UI | Custom component system + Ionicons |

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

# Run on web
npm run web
```

---

## Project Structure

```
deadliner-app/
├── App.tsx                     # App entry point
├── app.json                    # Expo config
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
│   ├── models/                 # TypeScript types (Deadline, ...)
│   ├── services/               # deadline-service, notification-service
│   ├── store/                  # Zustand stores (auth-store, deadline-store)
│   └── theme/                  # Colors, typography, spacing, layout
├── assets/                     # Fonts and images
└── firebase.json               # Firebase project config
```

---

## Deadline Status Colors

| Status | Color | Condition |
|---|---|---|
| On Track | 🟢 Green | More than 3 days remaining |
| Soon | 🟡 Yellow | 1–3 days remaining |
| Urgent | 🟠 Orange | Less than 24 hours remaining |
| Overdue | 🔴 Red | Past due date |

---

## Notifications

Notifications are scheduled locally on the device using `expo-notifications`. Supported reminder intervals:

- 5 minutes before
- 30 minutes before
- 1 hour before
- 1 day before

Notifications are automatically cancelled when a deadline is completed or deleted, and rescheduled when a deadline is restored from history.

---

## Author

**Maymae (Phetlada Duangkaew)**

---

## Version

v1.0.0
