
# FinTracker MVP (Expo)

This is a minimal Expo-compatible prototype of the Finance Tracker app you requested.

## Included
- `App.js` — simplified Expo app with notification listener hooks and modal to confirm parsed transactions.
- `src/services/parser.js` — SMS/notification parser (amount + intent).
- `package.json` — dependencies for Expo.

## Setup

1. Install Expo CLI (if not installed):
   ```bash
   npm install -g expo-cli
   ```

2. Install dependencies:
   ```bash
   cd fintracker_mvp
   npm install
   ```

3. Run the app:
   ```bash
   npm start
   ```

4. For testing notifications you can use `expo-notifications` APIs or trigger the `parseAmountFromText` function directly in code.

Note: This prototype uses Expo to simplify setup. Android notification capture via native NotificationListenerService requires a bare React Native app with native Android code; this Expo project demonstrates the JS-side parsing, modal, storage, and UI flow.
