# NourishNet

A cross-platform React Native application for connecting food donors with recipients in need, built for U-Turn Homeless Organisation. The app enables community members to post surplus food donations, claim donations, communicate via in-app chat, and build trust through ratings and reviews.

## Features

- **Post Donations**: Share surplus food with images, descriptions, categories, and expiry dates
- **Browse & Filter**: Discover nearby donations with category and distance filters
- **Claim System**: Reserve donations with first-come-first-serve messaging
- **Real-time Chat**: Communicate with donors/recipients per donation context
- **Activity Center**: Manage your donations and claims in one place
- **Ratings & Reviews**: Build trust through donor ratings and detailed reviews
- **Alerts System**: Real-time notifications for claims, pickups, and messages
- **Offline Support**: Queue actions when offline, sync when connection restored
- **Multi-platform**: Works on iOS, Android, and Web
- **Internationalization**: English, isiXhosa, and Afrikaans support

## Tech Stack

- **Framework**: React Native with Expo
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Maps**: Google Maps API (web), React Native Maps (native)
- **State Management**: React Context API
- **Navigation**: React Navigation
- **Internationalization**: react-i18next

## Prerequisites

- Node.js 18+ (Node 20 recommended)
- npm or yarn
- Expo CLI (installed via `npm install -g expo-cli` or use `npx expo`)
- Firebase project with Authentication, Firestore, and Storage enabled
- Google Maps API key (for web platform)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MealsOnWheels
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```
   
   Ensure your Google Maps API key has the following APIs enabled:
   - Maps JavaScript API (for web)
   - Maps SDK for Android (for Android)
   - Maps SDK for iOS (for iOS)
   - Geocoding API
   - Places API

4. **Configure Firebase**
   
   Create a Firebase project and enable:
   - Authentication (Email/Password, Google Sign-In)
   - Firestore Database
   - Storage
   
   Update `src/config/firebase.js` with your Firebase configuration:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   ```

5. **Deploy Firestore Security Rules**
   
   Deploy the security rules from `firestore.rules`:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Running the Application

### Development Mode

**Mobile (iOS/Android)**
```bash
npm start
# Then press 'i' for iOS simulator or 'a' for Android emulator
# Or scan the QR code with Expo Go app on your device
```

**Web**
```bash
npm run web
# Or
npx expo start --web
```

### Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Start on Android emulator
- `npm run ios` - Start on iOS simulator
- `npm run web` - Start web version
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues automatically
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:rules` - Run Firestore rules tests (requires emulator)

## Employee/Admin Access

The application includes an employee/admin dashboard for managing the platform. To access the admin dashboard:

1. From the login screen, click on the "Employee access" link (located below the logo)
2. Enter the following credentials:
   - **Username**: `nourishnetadmin`
   - **Password**: `Nouri$hNET`

The admin dashboard provides access to:
- Total donations, claims, and user statistics
- Recent donation activity
- System overview and metrics

**Note**: Admin access is separate from regular user authentication and does not require a Firebase account.

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ui/          # Base UI components (Button, Card, Input, etc.)
│   └── ...          # Feature-specific components
├── screens/          # Screen components
├── services/         # Business logic and API calls
├── hooks/            # Custom React hooks
├── contexts/         # React Context providers
├── navigation/       # Navigation configuration
├── domain/           # Domain models and repositories
│   ├── dtos/        # Data transfer objects
│   └── repository/  # Data access layer
├── utils/            # Utility functions
├── config/           # Configuration files
├── constants/        # App constants
└── i18n/             # Internationalization files
```

## Architecture

The application follows a layered architecture:

- **Presentation Layer**: React Native screens and components
- **Business Logic Layer**: Services that handle application logic
- **Data Access Layer**: Repository pattern for Firestore operations
- **State Management**: React Context for global state, local state with hooks

### Key Patterns

- **Repository Pattern**: Abstracts data access from business logic
- **Custom Hooks**: Encapsulate reusable logic (donations, alerts, filters)
- **Service Layer**: Business logic separated from UI components

## Data Model

The app uses the following Firestore collections:

- `users` - User profiles and preferences
- `donations` - Food donation listings
- `claims` - Donation reservation records
- `messages` - Chat messages between users
- `alerts` - User notifications
- `reviews` - Detailed donor reviews
- `ratings` - Star ratings for donors
- `userSettings` - User-specific settings

## Security

- **Authentication**: Firebase Authentication (Email/Password, Google Sign-In)
- **Authorization**: Firestore Security Rules enforce data access controls
- **Privacy**: Email addresses and phone numbers are not exposed to other users
- **Data Validation**: Client-side and server-side validation
- **Secure Storage**: Sensitive data stored securely, no secrets in code

See `firestore.rules` for detailed security rules.

## Testing

### Unit Tests
```bash
npm test
```

Tests are located in `__tests__/`:
- `validation.test.js` - Form validation utilities
- `sanitize.test.js` - Data sanitization
- `toSerializableDonation.test.js` - Navigation serialization
- `donationRepository.test.js` - Repository logic

### Firestore Rules Tests
```bash
npm run test:rules
```

Requires Firebase emulator to be installed and configured.

## Deployment

### Mobile Apps

**iOS**
```bash
eas build --platform ios
```

**Android**
```bash
eas build --platform android
```

See [Expo EAS Build documentation](https://docs.expo.dev/build/introduction/) for detailed instructions.

### Web

```bash
npx expo export:web
```

Deploy the `web-build/` directory to your hosting provider (Vercel, Netlify, etc.).

## Configuration

### Firebase Indexes

The following Firestore composite indexes are required:

1. `donations` collection:
   - Fields: `status` (Ascending), `createdAt` (Descending)

2. `claims` collection:
   - Fields: `claimantId` (Ascending), `status` (Ascending), `createdAt` (Descending)

Create these indexes in the Firebase Console or they will be created automatically when needed.

### Environment Variables

- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` - Required for web map functionality

## Troubleshooting

### Common Issues

**Images not uploading**
- Check Firebase Storage rules allow authenticated uploads
- Verify image file size (compressed to ~2-3MB)
- Check network connectivity

**Map not loading on web**
- Verify Google Maps API key is set in `.env`
- Ensure Maps JavaScript API is enabled in Google Cloud Console
- Check API key restrictions and allowed domains

**Firestore permission errors**
- Verify security rules are deployed: `firebase deploy --only firestore:rules`
- Check user authentication status
- Review Firestore rules in `firestore.rules`

**Offline queue not syncing**
- Check network connectivity indicator
- Verify Firebase connection status
- Review offline queue implementation in `src/services/offlineQueue.js`

## Contributing

1. Create a feature branch: `git checkout -b feat/your-feature`
2. Make your changes
3. Run tests: `npm test`
4. Run linter: `npm run lint`
5. Commit using conventional commits
6. Push and create a pull request

See `CONTRIBUTING.md` for detailed guidelines.

## License

MIT (Standard Academic Use)

## Support

For issues, questions, or contributions, please open an issue on the repository.

---

## AI Assistance Declaration

This project used AI tools to accelerate development, including design guidance, code refactoring suggestions, and helper code generation. All AI-generated output was reviewed, adapted, and tested by the development team prior to inclusion. Ownership and responsibility for the final implementation rests with the authors.

**Tools Used:**
- OpenAI GPT-5 (via Cursor) for code review suggestions, debugging assistance, and documentation drafting
- Anthropic Claude for architectural guidance and design pattern suggestions

All AI assistance was used in accordance with academic integrity guidelines, with proper attribution and critical review of all generated content.

## References

- Expo. (2025). *Expo Documentation*. https://docs.expo.dev
- Firebase. (2025). *Firebase Documentation*. https://firebase.google.com/docs
- Google. (2025). *Google Maps Platform Documentation*. https://developers.google.com/maps/documentation
- React Native Community. (2025). *React Native Documentation*. https://reactnative.dev
- OWASP. (2024). *OWASP Mobile Top 10 & API Security Guidelines*. https://owasp.org
- Project Management Institute. (2021). *A Guide to the Project Management Body of Knowledge (PMBOK Guide)*. 7th edn. PMI.
- Schwaber, K. & Sutherland, J. (2020). *The Scrum Guide*. https://scrumguides.org/scrum-guide.html
- Sommerville, I. (2016). *Software Engineering*. 10th edn. Pearson Education.
