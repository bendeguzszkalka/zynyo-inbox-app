# Zynyo Inbox App 📬

A modern, high-performance universal React Native inbox application built for managing document signing requests via the Zynyo API. Developed using **Expo SDK 56**, **Expo Router (File-Based Routing)**, and **TypeScript**, the app showcases a clean, strict Apple Human Interface Guidelines (HIG) inspired user interface, complete with global state management, adaptive layout densities, and dynamic document sorting.

---

## 🚀 Key Features

*   **Zynyo API Integration**: Fetches and aggregates real-time signing requests via the official Zynyo REST API.
*   **Authentication Flow**: Clean, strictly native Apple HIG login screen equipped with regex-based email validation and intelligent layout switching.
*   **Smart Inbox Sorting**: Dynamically surfaces actionable documents (e.g., awaiting user signature) to the top of the feed while pushing fully signed or rejected requests downwards.
*   **Inbox Density Layouts**: Customize the visual density of the inbox feed.
    *   `Comfortable`: Spaced-out rows providing a relaxed reading experience.
    *   `Compact`: High-information density list stripping away auxiliary descriptions.
*   **Global Context State**: Session, theme, and layout density managed smoothly via React Context APIs (`AuthContext` and `PreferencesContext`).
*   **Strict Native Adherence**: Utilizes standard iOS system colors (e.g. `systemGroupedBackground`, `secondarySystemGroupedBackground`), native typography, continuous border curves, and `PlatformColor` APIs for an OS-indistinguishable feel.

---

## 🛠 Tech Stack

*   **Framework**: Expo (SDK 56) / React Native
*   **Router**: Expo Router (v2 / v56 File-based Navigation)
*   **Package Manager**: `pnpm`
*   **State Management**: React Context (`AuthContext`, `PreferencesContext`)
*   **Validation**: Strict Regular Expressions & TypeScript Validation
*   **Icons**: `@expo/vector-icons` (Ionicons)

---

## 📋 Changelog

* **Added Authentication Flow**: Fully mocked Zynyo login layer with session management and intelligent router stack clearing via `router.dismissAll()`.
* **HIG Compliant Login UI**: Overhauled the login screen to conform fully to Apple Design Guidelines, utilizing native text-content types, system semantic colors, grouped card views, and 24pt continuous corner radii for seamless system integration.
* **Density Toggles**: Implemented the ability to switch between Compact and Comfortable list layouts in the Settings panel.
* **Dynamic Email Hookup**: Migrated from `.env` hardcoded email bindings to dynamic email fetching based on the active user session.
* **Refactored Routing**: Strengthened `_layout.tsx` to conditionally prevent unauthorized access, automatically redirect, and natively handle deep-link popping.

---

## 💻 Getting Started

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine. This project utilizes `pnpm` as its package manager.

### 2. Environment Variables
Create a `.env` file in the root directory (based on `.env.example`) and fill in your Zynyo API credentials:
```env
EXPO_PUBLIC_ZYNYO_API_URL=https://api.zynyo.com/v1
EXPO_PUBLIC_ZYNYO_API_KEY=your_zynyo_api_key_here
```

### 3. Install Dependencies
Run the following command in the root folder:
```bash
pnpm install
```

### 4. Start the Development Server
Fire up the Metro bundler:
```bash
pnpm start -c
```

### 5. Running on Device / Simulator
Once the Metro bundler is running, you can open the app on your preferred platform:
*   Press `i` to boot the iOS Simulator.
*   Press `a` to boot the Android Emulator.
*   Press `w` to open the app inside the web browser.
