# AI Sprint Simulator

A learning and simulation product that helps leaders and teams experience how daily AI-driven re-estimation creates unprecedented visibility, predictability, and confidence in engineering execution.

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to the URL shown in the terminal (typically `http://localhost:5173`)

## Project Structure

```
src/
  ├── screens/          # Main application screens
  │   ├── TeamSetupScreen.tsx
  │   └── EpicBreakdownScreen.tsx
  ├── state/            # Zustand state management
  │   └── simulationStore.ts
  ├── utils/            # Utility functions
  │   ├── teamCapacity.ts
  │   └── storyGenerator.ts
  ├── types.ts          # TypeScript type definitions
  ├── App.tsx           # Main app component
  └── main.tsx          # Entry point
```

## Features Implemented

### Screen 1: Team Definition
- Add team members with skills and availability
- View team capacity calculations
- Edit and remove team members
- Real-time capacity updates

### Screen 2: Epic Definition & Breakdown
- Define epic title and description
- AI-powered story generation (rule-based v1)
- View generated stories with point estimates
- Accept epic to proceed to sprint simulation

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons

## Next Steps

The sprint simulation screen (Screen 3) is a placeholder and will be implemented next.

