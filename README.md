# Verby

<img src="./public/logo.png" alt="Verby" width="64" height="64" />

Master French verbs through play.

---

## Features

- **Blitz Mode** - 60 seconds. How many verbs can you conjugate correctly? Climb the ELO ladder!
- **Verby Streak** - How long can you go? One mistake ends the game. Build your streak!
- **Zen Mode** - Practice at your own pace. Customize modes and tenses. No pressure.
- **Leaderboards** - Compete with players worldwide across all game modes

---

## Tech Stack

| Technology | Description |
|------------|-------------|
| [React](https://react.dev/) | UI library |
| [Vite](https://vitejs.dev/) | Build tool and dev server |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS framework |
| [React Router](https://reactrouter.com/) | Client-side routing |
| [Firebase](https://firebase.google.com/) | Authentication and database |
| [Recharts](https://recharts.org/) | Rating evolution charts |

---

## Prerequisites

- Node.js 18+
- A Firebase project with:
  - **Authentication** - Enable Google sign-in provider
  - **Realtime Database** - Create a database

---

## Getting Started

### 1. Clone the Repository

```sh
git clone https://github.com/Untitled-Master/Verbyapp.git
cd Verbyapp
```

### 2. Set Up Firebase

Create a `.env` file in the root directory with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

To get these values:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Add a Web app in Project Settings
4. Copy the config values
5. Enable **Google** sign-in in Authentication > Sign-in method
6. Create a **Realtime Database** and set rules to allow authenticated read/write

### 3. Install Dependencies

```sh
npm install
```

### 4. Run Development Server

```sh
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for Production

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```

---

## Firebase Database Structure

The app uses Firebase Realtime Database with the following structure:

```
users/
  {uid}/
    profile/        # User profile data
    stats/          # Game statistics (blitz, streak, zen)
    gameHistory/    # History of played games
    ratingHistory/  # Daily rating snapshots
```

### Database Rules (for development)

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

---

## Linting

```sh
npm run lint
```

---

## Project Structure

```
src/
├── pages/
│   ├── arena/           # Game modes (Blitz, VerbyStreak, ZenMode)
│   ├── community/       # Leaderboards
│   ├── profile/         # User profiles
│   ├── tools/           # Verb search tools
│   └── admin/           # Admin dashboard
├── components/
│   └── MainNavbar.jsx   # Main navigation
├── context/
│   └── AuthContext.jsx # Firebase authentication
└── lib/
    └── firebase.js      # Firebase configuration
```

---

## Contributing

Contributions are welcome! Here's how you can help:

### Ways to Contribute

- **Bug Reports** - Found a bug? Open an issue with steps to reproduce.
- **Feature Ideas** - Have an idea for a new feature? We'd love to hear it.
- **Code Contributions** - Submit pull requests for bug fixes or new features.
- **Documentation** - Help improve the docs or translate them.

### Development Workflow

1. **Fork the repository** and clone your fork
2. **Create a branch** for your changes:
   ```sh
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** and commit them:
   ```sh
   git commit -m "feat: add new feature"
   ```
4. **Push to your fork**:
   ```sh
   git push origin feature/your-feature-name
   ```
5. **Open a Pull Request** against the `main` branch

### Code Standards

- Use functional components with hooks
- Follow the existing code style
- Run `npm run lint` before committing
- Write meaningful commit messages

---

## External APIs

Verby uses the [VerbyBack API](https://github.com/Untitled-Master/verby-back) for:
- Random verb generation
- Verb conjugation lookup
- Verb search/autocomplete

---

## License

MIT
