# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
# Start the development server
yarn start

# Run on Android
yarn android

# Run on iOS
yarn ios

# Run tests
yarn test

# Install dependencies
yarn install
```

### Building with EAS
```bash
# Build for production
eas build --platform all

# Build for iOS only
eas build --platform ios

# Build for Android only
eas build --platform android
```

## Architecture Overview

This is a React Native mobile application built with Expo SDK v53 for finding Alltrucks workshops and service centers.

### Core Technologies
- **React Native 0.79.2** with React 19.0.0
- **Expo SDK 53** for cross-platform development
- **React Navigation v6** for screen navigation
- **react-native-maps** for map visualization
- **Context API** for state management

### Application Structure

The app follows a standard React Native structure with three main screens accessible via bottom tab navigation:

1. **MapScreen** (`screens/MapScreen.js`): Displays workshops on an interactive map
2. **ListeScreen** (`screens/ListeScreen.js`): Shows workshops in a searchable list format
3. **AssistanceScreen** (`screens/AssistanceScreen.js`): Provides assistance/help features

### Key Architectural Patterns

1. **Data Flow**:
   - App.js handles initial location permissions and data loading
   - Workshop data is fetched from the Alltrucks API (see `Utile.js` for endpoints)
   - Data is cached in AsyncStorage for offline access
   - AppContext (`context/AppContext.js`) shares data across screens

2. **Location Services**:
   - Uses expo-location for GPS functionality
   - Calculates distances using geolib/haversine
   - Sorts workshops by proximity to user

3. **API Integration**:
   - Base URL configured in `Utile.js`
   - Uses Axios for HTTP requests
   - Endpoints: `/api/workshops`, `/api/assistance`

4. **Component Patterns**:
   - Main App.js uses class components with lifecycle methods
   - Screen components are primarily functional components
   - Custom components in `components/` directory

### Important Files

- `App.js`: Main entry point, handles initialization and data loading
- `Utile.js`: API configuration and endpoints
- `navigation/MainTabNavigator.js`: Navigation structure
- `context/AppContext.js`: Global state management
- `app.json`: Expo configuration
- `eas.json`: Build configuration for EAS

### Development Notes

- The app requires location permissions to function properly
- Test on physical devices for accurate GPS functionality
- Uses custom fonts (SF Pro Display/Text) loaded from assets
- Supports both iOS and Android platforms
- Current version: 2.0.0 (Android versionCode: 30)