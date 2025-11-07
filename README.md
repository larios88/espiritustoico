# Podcast Player App

A custom React Native podcast player app designed for Anchor.fm content with advanced features for playback, customization, and monetization.

## Prerequisites

Before running this project, ensure you have the following installed:

### Required Software

1. **Node.js** (version 16 or higher)
   - Download from: https://nodejs.org/
   - Includes npm package manager

2. **React Native CLI**
   ```bash
   npm install -g react-native-cli
   ```

3. **React Native Development Environment**
   - Follow the official React Native environment setup guide: https://reactnative.dev/docs/environment-setup
   - Choose "React Native CLI Quickstart" for your development OS and target OS

### For Android Development
- Android Studio
- Android SDK
- Java Development Kit (JDK)

### For iOS Development (macOS only)
- Xcode
- iOS Simulator
- CocoaPods

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Install iOS dependencies (macOS only)**
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Link native dependencies**
   ```bash
   npx react-native link
   ```

## Development Scripts

- `npm start` - Start Metro bundler
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── components/     # Reusable UI components
├── services/       # Business logic and API services
├── models/         # Data models and interfaces
├── utils/          # Utility functions
├── hooks/          # Custom React hooks
├── constants/      # App constants
└── types/          # TypeScript type definitions
```

## Features

- RSS feed integration with Anchor.fm
- Advanced audio playback controls
- Custom theme customization
- Advertisement integration
- Bookmark and snippet sharing
- Social media links
- Admin interface for content management
- Offline support
- Background playback

## Configuration

The app is configured with:
- ESLint for code quality
- Prettier for code formatting
- TypeScript for type safety
- Jest for testing
- Path aliases for clean imports

## RSS Feed

The app is configured to fetch episodes from:
`https://anchor.fm/s/10361fcfc/podcast/rss`

## Default Theme

- Background Color: #000000 (Black)
- Text Color: #9f8069 (Muted Orange)

## Development Notes

- The app uses Redux Toolkit for state management
- React Navigation for navigation
- react-native-track-player for audio playback
- SQLite for local data storage
- Custom color picker for theme customization

## Troubleshooting

If you encounter issues:

1. **Metro bundler issues**: Run `npx react-native start --reset-cache`
2. **Android build issues**: Clean and rebuild with `cd android && ./gradlew clean && cd ..`
3. **iOS build issues**: Clean build folder in Xcode or run `cd ios && xcodebuild clean && cd ..`
4. **Dependency issues**: Delete `node_modules` and run `npm install` again

## License

This project is proprietary software for podcast content distribution.