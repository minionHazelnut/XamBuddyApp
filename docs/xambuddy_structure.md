# XamBuddyRN Project Structure

Project: XamBuddyRN
Type: React Native exam prep app
Platform: iOS and Android

Key structure:
- Root: React Native app entry points `App.js`, `index.js`, `app.json`, `babel.config.js`, `metro.config.js`, `tsconfig.json`
- `Screens/`: main app screens including `HomeScreen.js`, `PracticeScreen.js`, `ProfileScreen.js`, `QBankScreen.js`, `RioScreen.js`
- `android/`: Android project files and Gradle build configuration
- `ios/`: iOS Xcode project and CocoaPods integration
- `assets/` and `Images/`: app assets and icons
- `__tests__/`: Jest test folder

Dependencies:
- React Native `0.84.1`, React `19.2.3`
- Navigation: `@react-navigation/native`, `@react-navigation/bottom-tabs`
- UI/animation libs: `react-native-gesture-handler`, `react-native-reanimated`, `react-native-linear-gradient`, `react-native-safe-area-context`, `react-native-screens`, `react-native-vector-icons`

Purpose:
- Initial content targets CBSE 10th exam preparation
- Design accommodates adding other exams in future
