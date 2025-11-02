# Expense Tracker Pro

A modern, cross-platform expense tracking application built with Next.js and React Native.

## 🚀 Features

- **Cross-Platform**: Native mobile app (React Native) and web app (Next.js)
- **Real-time Sync**: Powered by Supabase for seamless data synchronization
- **Authentication**: Secure user authentication and session management
- **Expense Tracking**: Add, edit, and delete transactions
- **Budget Management**: Set and track budgets by category
- **Reports & Analytics**: Comprehensive financial insights
- **Dark Mode**: Beautiful UI with dark mode support

## 📁 Project Structure

```
expense-tracker-pro/
├── web/              # Next.js web application
├── mobile/           # React Native mobile application
├── shared/           # Shared TypeScript types
└── docs/             # Documentation and schemas
```

## 🛠️ Tech Stack

### Web
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Type Safety**: TypeScript 5

### Mobile
- **Framework**: React Native with Expo
- **Navigation**: React Navigation
- **Styling**: NativeWind (Tailwind for React Native)
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Type Safety**: TypeScript

### Shared
- **Types**: TypeScript shared definitions

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- (For mobile) Expo Go app on your device

### 1. Clone the Repository

```bash
git clone <repository-url>
cd expense-tracker-pro
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. Run the database migrations (TODO: Add schema SQL)

### 3. Set Up Web Application

```bash
cd web
npm install

# Create .env.local file
cp .env.example .env.local

# Add your Supabase credentials to .env.local
# NEXT_PUBLIC_SUPABASE_URL=your_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 4. Set Up Mobile Application

```bash
cd mobile
npm install

# Create .env file (if it doesn't exist)
# Note: You can create it manually or copy from the web app .env.local

# Add your Supabase credentials to .env file:
# EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
# EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Start Expo development server
npm start
# OR
npm run android    # For Android emulator
npm run ios        # For iOS simulator
```

#### Testing on Physical Device:

1. **Install Expo Go** on your phone:
   - iOS: Download from [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: Download from [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Run the app**:
   ```bash
   cd mobile
   npm start
   ```

3. **Connect to the same Wi-Fi network** as your computer

4. **Scan the QR code**:
   - **iOS**: Open the Camera app and point it at the QR code
   - **Android**: Open the Expo Go app and tap "Scan QR Code"

#### Testing on Emulator/Simulator:

1. **Android Emulator**:
   ```bash
   cd mobile
   npm run android
   ```
   *(Make sure you have Android Studio and an emulator installed)*

2. **iOS Simulator** (Mac only):
   ```bash
   cd mobile
   npm run ios
   ```
   *(Make sure you have Xcode installed)*

## 📱 Mobile App

The mobile app is built with React Native and Expo. It features:

- Bottom tab navigation
- Screens for Dashboard, Transactions, Budgets, Reports, and Settings
- Native styling with NativeWind
- Full feature parity with web app

## 🌐 Web App

The web app is built with Next.js 16 and features:

- Server-side rendering and API routes
- Supabase authentication middleware
- Responsive design with Tailwind CSS
- Dark mode support

## 🔐 Authentication

Both web and mobile apps use Supabase authentication:

- Email/password authentication
- Secure session management
- Automatic token refresh
- Protected routes

## 📊 Database Schema

(TODO: Add database schema documentation)

Key tables:
- `users` - User profiles
- `transactions` - Expense/income records
- `budgets` - Budget allocations
- `categories` - Expense categories

## 🧪 Development

### Web Development

```bash
cd web
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Mobile Development

```bash
cd mobile
npm start            # Start Expo dev server
npm run android      # Run on Android
npm run ios          # Run on iOS
```

## 🧩 Shared Types

The `shared/` directory contains TypeScript types used by both web and mobile apps:

- User types
- Transaction types
- Budget types
- Report types

Import in your code:

```typescript
import { Transaction, Budget } from '@/shared/types';
```

## 🚢 Deployment

### Web Deployment

Deploy to Vercel:

```bash
cd web
vercel
```

Or use any other hosting platform that supports Next.js.

### Mobile Deployment

Build for production:

```bash
cd mobile
eas build --platform android
eas build --platform ios
```

## 📝 Environment Variables

### Web (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Mobile (.env)

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

## 🤝 Contributing

(TODO: Add contribution guidelines)

## 📄 License

MIT License

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the amazing backend
- [Next.js](https://nextjs.org) for the web framework
- [React Native](https://reactnative.dev) for cross-platform mobile
- [Expo](https://expo.dev) for the development tools
