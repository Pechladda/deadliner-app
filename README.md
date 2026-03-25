# Deadliner

Deadliner is an Expo React Native app for students to manage assignment deadlines with urgency-focused UI, reminders, history, and privacy-conscious data controls.

## Setup

1. Install dependencies.

```bash
npm install
```

2. Create environment variables.

```bash
cp .env.example .env
```

3. Fill in Firebase values in `.env`.

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`

4. Run the app.

```bash
npm start
```

5. If you changed `.env` values, restart Expo with cache clear.

```bash
npx expo start -c
```

## Environment Notes

- Firebase config is loaded from Expo public env variables in `src/core/config/env.ts`.
- The app throws a startup error if any required Firebase env variable is missing.
- Do not commit real secrets to version control.

## Scripts

- `npm start` starts Expo
- `npm run ios` runs on iOS simulator
- `npm run android` runs on Android emulator/device
- `npm run web` runs web target
- `npm run lint` runs Expo lint checks

## Architecture Highlights

- Feature-based modules under `src/features`
- Centralized theme tokens under `src/theme`
- Firestore access isolated in `src/services/deadline-service.ts`
- Notifications isolated in `src/services/notification-service.ts`
- Zustand stores under `src/store`

## Privacy & Data

- First-use consent checkbox before login
- Dedicated Privacy Policy screen
- "Delete All Data" action in Settings
- Stored data is limited to deadlines, reminders, and app preferences
