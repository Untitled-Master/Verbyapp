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

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```sh
git clone https://github.com/Untitled-Master/Verbyapp.git
cd Verbyapp
npm install
```

### Development

```sh
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```

### Linting

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
│   ├── profile/        # User profiles
│   ├── tools/          # Verb search tools
│   └── admin/          # Admin dashboard
├── components/
│   └── MainNavbar.jsx  # Main navigation
├── context/
│   └── AuthContext.jsx # Firebase authentication
└── lib/
    └── firebase.js     # Firebase configuration
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

### API

Verby uses the [VerbyBack API](https://github.com/Untitled-Master/verby-back) for verb conjugations.

---

## License

MIT
