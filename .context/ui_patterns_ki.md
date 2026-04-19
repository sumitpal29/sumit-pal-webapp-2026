# KI: UI Patterns & Styling

The project follows a modern, dark-themed design system with smooth animations and responsive layouts.

## Styling System (Tailwind 4)
- **Tailwind 4**: Configured via `@tailwindcss/postcss`.
- **Design Tokens**: Defined as CSS variables in `app/globals.css`.
  - Background: `--background` (#0a192f)
  - Primary: `--primary` (#64ffda)
  - Text: High-contrast light blue/gray palette.
- **Utilities**: Uses standard Tailwind utility classes for layout, spacing, and typography.

## Animation Strategy (Framer Motion)
- **Scroll Animations**: Sections use `whileInView` for entrance transitions.
- **Micro-interactions**: Subtle hover effects on links and buttons.
- **Cursor Glow**: A dynamic, hardware-accelerated follow effect implemented in `components/portfolio/cursor-glow.tsx`.

## Layout & Navigation
- **Sidebar (`sidebar.tsx`)**: Fixed on large screens, hidden/mobile-optimized on small screens.
- **Scroll Spy**: `useScrollSpy` hook detects the current section `id` in view and updates the sidebar active state.
- **Sections**: Each main feature is a self-contained component in `components/portfolio/`.

## Component Library
- Uses **Radix UI** for accessible primitives (Accordion, Dialog, etc.).
- Icons provided by **Lucide React**.
- Custom components follow a consistent pattern: `client` components where interactivity is needed, `server` components for data-heavy sections if possible (though most are currently client-side or wrapped in client layouts).
