# Relevare (Skin Clinic Management System)

Relevare is a Next.js App Router project for clinic operations: dashboard, clients, transactions, inventory, reports, settings, and more.

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui

## Project Structure

This project uses `src/` as the source root.

- `src/app` - routes and layouts
- `src/components` - reusable UI and feature components
- `src/lib` - utilities, constants, API stubs, mock data
- `src/types` - TypeScript interfaces/types
- `src/hooks` - custom hooks

## Clone and Setup

### 1) Clone repository

```bash
git clone <your-repo-url>
cd skinclinic
```

### 2) Install dependencies

```bash
npm install
```

### 3) Environment variables

Create `.env.local` in the project root.

If you do not yet have backend integration, you can keep it minimal:

```env
# Add project env vars here when needed
```

### 4) Run development server

```bash
npm run dev
```

App will run at:

[http://localhost:3000](http://localhost:3000)

## Available Scripts

```bash
npm run dev       # start development server
npm run build     # production build
npm run start     # run production server
npm run lint      # run ESLint
npm run typecheck # run TypeScript checks
```

## Troubleshooting

- If you get stale route/type errors after major file moves, clear cache and restart dev server:

```bash
rm -rf .next
npm run dev
```

For Windows PowerShell:

```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

## Adding shadcn Components

```bash
npx shadcn@latest add button
```

Then import:

```tsx
import { Button } from "@/components/ui/button"
```
added jumar branch