# Agent Guidelines for Verby

This document provides guidelines for agents working on the Verby codebase.

---

## Project Overview

Verby is a French verb conjugation learning app built with React, Vite, Tailwind CSS, and React Router.

---

## Commands

### Development
```sh
npm run dev          # Start development server at localhost:5173
npm run preview      # Preview production build
```

### Build & Lint
```sh
npm run build        # Production build to /dist
npm run lint         # Run ESLint on all files
```

### Single File Linting
```sh
npx eslint src/pages/VerbyLanding.jsx    # Lint specific file
npx eslint src/**/*.jsx --fix             # Lint with auto-fix
```

---

## Code Style Guidelines

### General Principles
- Use functional components with hooks (no class components)
- Prefer `const` over `let` for variable declarations
- Use named exports for utilities, default exports for page components

### File Organization
```
src/
├── app.jsx              # Main router setup
├── main.jsx             # Entry point
├── pages/               # Route page components
│   └── VerbyLanding.jsx
├── components/          # Reusable UI components
│   ├── Navbar.jsx
│   └── Footer.jsx
└── lib/
    └── utils.js         # Utility functions (cn helper)
```

### Import Order
1. React imports (`import React from 'react'`)
2. Third-party libraries (lucide-react, react-router-dom, etc.)
3. Component imports
4. Utils/helpers
5. CSS/style imports

```jsx
// Good
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import { cn } from './lib/utils';

// Avoid
import Navbar from './components/Navbar';
import React, { useState } from 'react';
import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
```

### Component Structure
```jsx
// Sub-components defined at the bottom of the file
const DropdownItem = ({ icon, title, desc }) => (
  <a href="#" className="...">
    {icon}
    <span>{title}</span>
  </a>
);

export default MyComponent;
```

### Naming Conventions
- Components: PascalCase (`VerbyLanding`, `Navbar`)
- Functions/Variables: camelCase (`isOpen`, `handleClick`)
- Files: PascalCase for components (`Navbar.jsx`), camelCase for utils (`utils.js`)
- CSS classes: kebab-case with Tailwind utilities

### React Patterns
- Use `useState` for local component state
- Use `useEffect` for side effects
- Inline arrow functions for simple callbacks
- Extract sub-components when JSX exceeds ~50 lines

### Tailwind CSS
- Use the project's custom color variables: `text-[#EB3514]`, `bg-[#F0EFEB]`
- Stick to the established color palette (see `tailwind.config.js`)
- Use `font-mono` for UI text, `font-sans` for headings
- Prefer inline styles only when Tailwind cannot achieve the effect

### Routing
Routes are configured in `app.jsx` using React Router v7:

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VerbyLanding from './pages/VerbyLanding';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<VerbyLanding />} />
      </Routes>
    </Router>
  );
}
```

### Error Handling
- Use try/catch for async operations
- Provide fallback UI for error states
- Log errors appropriately (avoid console.log in production code)

---

## Adding New Pages

1. Create the page component in `src/pages/`
2. Export it as default
3. Add the route in `app.jsx`:

```jsx
import NewPage from './pages/NewPage';

<Route path="/new-page" element={<NewPage />} />
```

---

## Adding Components

1. Create in `src/components/`
2. Use `cn()` utility from `lib/utils.js` for conditional classes
3. Export as default

```jsx
import { cn } from '../lib/utils';

const Button = ({ className, ...props }) => (
  <button className={cn('px-4 py-2', className)} {...props} />
);

export default Button;
```

---

## Linting

Always run `npm run lint` before committing. Fix any errors or warnings reported by ESLint.

---

## Dependencies

Key dependencies:
- `react` / `react-dom`: UI framework
- `react-router-dom`: Routing (v7)
- `tailwindcss`: Styling
- `lucide-react`: Icons
- `sonner`: Toast notifications
- `clsx` / `tailwind-merge`: Class name utilities
