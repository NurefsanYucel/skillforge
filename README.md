# SkillForge

SkillForge is a full-stack learning tracker web application that helps users manage learning goals, save resources, and track their progress.

## Features

- User registration and login with Supabase Auth
- Password validation during registration
- User profile with username, full name, and profile picture
- Create, edit, delete, and search learning goals
- Add learning resources to each goal
- Track resource status: Todo, In Progress, Completed
- Automatic progress calculation with progress bars
- Recent activity logs

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Database
- Supabase Storage

## Project Structure

```txt
app/
├── dashboard/
├── goals/[id]/
├── login/
├── profile/
├── register/
├── layout.tsx
└── page.tsx

components/
└── Navbar.tsx

lib/
└── supabase.ts