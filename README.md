# Zynyo Inbox App 📬

A modern, high-performance, universal React Native inbox application built using **Expo SDK 56**, **Expo Router (File-Based Routing)**, and **TypeScript**. The app showcases a clean, iOS-inspired user interface designed for reading message notifications, complete with global preferences management, adaptive layout densities, and native-feeling dark and light themes.

---

## 🚀 Key Features

*   **Dynamic Theming**: Full support for **Light Mode**, **Dark Mode**, and **System Default** settings. Navigation headers and backgrounds adapt smoothly using native rendering.
*   **Inbox Density Layouts**: Customize the visual density of the inbox screen. Switch between:
    *   `Comfortable`: Spaced-out rows with generous breathing room (16px vertical padding).
    *   `Compact`: High-information density list (8px vertical padding).
*   **Global Preferences State**: Managed via a React Context API wrapper (`PreferencesContext`), allowing multiple pages to instantly adapt to configuration changes (e.g. notifications, badges, theme, layout).
*   **iOS & Android Native Conventions**: Uses native headers, translucent navigation panels, platform-specific icons (Ionicons), and native Alert dialogs.
*   **Strict Type-Checking**: Developed entirely in TypeScript with strict compilation validation.

---

## 🛠 Tech Stack

*   **Framework**: Expo (SDK 56)
*   **Router**: Expo Router (v2 / v56 File-based Navigation)
*   **Package Manager**: `pnpm`
*   **State Management**: React Context (`PreferencesContext`)
*   **Icons**: `@expo/vector-icons` (Ionicons)

---

## 📦 Project Structure

```bash
zynyo-inbox-app/
├── src/
│   ├── app/                      # Expo Router screen entrypoints
│   │   ├── _layout.tsx           # Application root wrapper, global state provider & theme provider
│   │   ├── index.tsx             # Inbox feed screen displaying inbox items
│   │   └── settings.tsx          # Settings screen containing preferences toggles and dialogs
│   ├── constants/
│   │   ├── data.ts               # Static screen layout data and mock inbox records
│   │   └── theme.ts              # Dynamic styling tokens (light/dark colors, spacing, typography)
│   └── context/
│   │   └── PreferencesContext.tsx # React Context and hooks managing global preferences
├── assets/                       # Images and static static assets
├── tsconfig.json                 # Strict TypeScript configuration
└── package.json                  # Dependencies configuration
```

---

## 💻 Getting Started

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine. This project utilizes `pnpm` as its package manager.

### 2. Install Dependencies
Run the following command in the root folder:
```bash
pnpm install
```

### 3. Start the Development Server
Fire up the Metro bundler:
```bash
pnpm start
```
You can clear the bundler cache during start using:
```bash
pnpm start -c
```

### 4. Running on Device / Simulator
Once the Metro bundler is running, you can open the app on your preferred platform:
*   Press `i` or run `pnpm ios` to boot the iOS Simulator.
*   Press `a` or run `pnpm android` to boot the Android Emulator.
*   Press `w` or run `pnpm web` to open the app inside the web browser.

---

## 🧪 Validation & Type-Checking

To run static type-checking and ensure code validity:
```bash
./node_modules/.bin/tsc --noEmit
```
