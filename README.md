# Alltrucks Map

A React Native mobile application for finding Alltrucks workshops and service centers.

## Features

- 🗺️ Interactive map view of workshops
- 📋 Searchable list of all workshops
- 📍 Location-based sorting to find nearest workshops
- 🚑 Assistance/help section
- 💾 Offline data caching

## Prerequisites

- Node.js (v16 or higher)
- Yarn package manager
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac) or Android Emulator
- Expo Go app on your physical device (optional)

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd alltrucks_map
```

2. Install dependencies:
```bash
yarn install
```

## Running the Application

### Development Server

Start the Expo development server:
```bash
yarn start
```

This will open the Expo Dev Tools in your browser.

### Running on Specific Platforms

**iOS Simulator (Mac only):**
```bash
yarn ios
```

**Android Emulator:**
```bash
yarn android
```

**Physical Device:**
1. Install the Expo Go app from App Store or Google Play
2. Scan the QR code displayed in the terminal or Expo Dev Tools
3. Make sure your device is on the same network as your development machine

## Building for Production

This project uses [Expo Application Services (EAS)](https://expo.dev/eas) for building.

**Build for all platforms:**
```bash
eas build --platform all
```

**Build for iOS only:**
```bash
eas build --platform ios
```

**Build for Android only:**
```bash
eas build --platform android
```

## Configuration

- **API Endpoints**: Configure in `Utile.js`
- **App Configuration**: Modify `app.json` for app metadata
- **Build Configuration**: Update `eas.json` for build settings

## Permissions

The app requires the following permissions:
- **Location**: To find workshops near the user
- **Network**: To fetch workshop data from the API

## Tech Stack

- React Native 0.79.2
- Expo SDK 53
- React Navigation v6
- react-native-maps
- expo-location
- React Context API for state management

## Project Structure

```
alltrucks_map/
├── App.js                 # Main application entry
├── Utile.js              # API configuration
├── screens/              # Screen components
│   ├── MapScreen.js      # Map view
│   ├── ListeScreen.js    # List view
│   └── AssistanceScreen.js # Assistance screen
├── navigation/           # Navigation setup
├── context/             # State management
├── components/          # Reusable components
└── assets/             # Images, fonts, icons
```

## Version

Current version: 2.0.0