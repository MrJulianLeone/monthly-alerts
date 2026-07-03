# MonthlyAlerts Mobile

React Native + Expo app for MonthlyAlerts — the chat-first personal health coach.

<<<<<<< HEAD
## Screens

- **Onboarding** — single entry point with the 16+ age gate. Under-16 users send a
  parent-setup email; 16+ users self-sign up with a quick profile (DOB required).
- **Coach (main)** — chat interface with the AI Coach. Two actions only:
  **Snap Meal** (camera → GPT-4o vision feedback) and **I Did It** (completes the
  current challenge, immediately unlocking the next one).
- **Leaderboard** — invite-only boards (max 3), active friends from the last 14 days,
  goal of 5 friends per board.
- **History** — monthly summaries (the core deliverable), meals, and challenges.
- **Refer** — send leaderboard invitations by email.
- **Settings** — profile, subscription status, weight logging, log out.

## Development

```bash
npm install
npm start          # Expo dev server; scan the QR code with Expo Go
```

The API base URL comes from `expo.extra.apiUrl` in `app.json`
(defaults to https://monthlyalerts.com). Point it at your dev server for local work.

## Notes

- Auth tokens are stored in `expo-secure-store` and sent as `Authorization: Bearer`.
- Push notifications register the Expo push token with `POST /api/push/register`;
  the backend caps smart nudges at 2–3 per day.
- Building for the App Store / Play Store requires an Expo (EAS) account:
  `npx eas build`.
=======
This folder is a placeholder in the monorepo. The Expo app (starting with the
chat UI: AI Coach feed, "Snap Meal" camera action, "I Did It" challenge button,
and bottom navigation for Leaderboard / History / Refer Friends / Settings)
is the next build step after the backend API routes.
>>>>>>> origin/main
