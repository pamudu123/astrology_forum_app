# Swasthi Life - Mobile App Guide

This guide explains how to run the mobile application locally using Expo Go and how to build it for Android in **APK** (for local testing) and **AAB** (for Google Play Store distribution) formats using EAS Build.

---

## 1. Running with Expo Go

Expo Go allows you to run and preview the mobile app on a physical device or emulator without compilation.

### Prerequisites
- Node.js installed.
- Expo Go app installed on your mobile device (available on [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) and [iOS App Store](https://apps.apple.com/app/expo-go/id984023376)).

### Setup Steps
1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables. Copy `.env.example` to `.env` and fill in the API URL (e.g., your local machine's IP address if testing on a physical device):
   ```bash
   # For local backend testing (replace with your local IP if using physical device)
   EXPO_PUBLIC_API_URL=http://localhost:8000
   ```
4. Start the Expo development server:
   ```bash
   npx expo start
   ```
5. Scan the QR code displayed in the terminal:
   - **Android**: Open the Expo Go app and tap "Scan QR Code".
   - **iOS**: Scan the QR code using your system Camera app.

---

## 2. Setting Up EAS Build Configuration

Expo Application Services (EAS) is the recommended service to compile Android APKs and AABs. 

### Prerequisites
1. Install EAS CLI globally:
   ```bash
   npm install -g eas-cli
   ```
2. Log in or create an Expo account:
   ```bash
   eas login
   ```
3. Initialize EAS Configuration in your project:
   ```bash
   eas build:configure
   ```

This command will automatically create an `eas.json` configuration file at the root of your `mobile/` directory.

### Recommended `eas.json` Configuration
To build both APK and AAB formats, update the generated `eas.json` file to include a `preview` profile for APKs and a `production` profile for AABs:

```json
{
  "cli": {
    "version": ">= 10.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## 3. Building an APK (For Local Installation & Testing)

APKs are used to sideload and test the compiled application on any physical Android device or emulator.

Run the following command to build the Android APK:
```bash
eas build -p android --profile preview
```

### Options:
- **Cloud Build (Default)**: EAS will build the app on Expo's remote servers and generate a downloadable link to the `.apk` file.
- **Local Build** (requires Android SDK and Gradle set up on your machine):
  ```bash
  eas build -p android --profile preview --local
  ```

---

## 4. Building an AAB (For Google Play Store Distribution)

Android App Bundles (AAB) are required by Google Play to publish applications on the Play Store.

Run the following command to build the Android AAB:
```bash
eas build -p android --profile production
```

### Options:
- **Cloud Build (Default)**: EAS compiles the `.aab` bundle remotely. Once completed, you can download it from your Expo dashboard to upload directly to the Google Play Console.
- **Local Build**:
  ```bash
  eas build -p android --profile production --local
  ```
