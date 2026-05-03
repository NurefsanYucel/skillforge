SkillForge

SkillForge is a full-stack learning tracker web application that helps users manage learning goals, organize resources, and track progress in a structured way.

Features

Authentication
Secure sign up & login using Supabase Auth
Password validation with real-time feedback

User Profiles
Set username and full name
Upload profile picture (Supabase Storage)
View recent activity logs

Goal Management
Create, edit, and delete learning goals
Search goals instantly

Resource Tracking
Add resources (videos, articles, courses, etc.)
Mark progress (Todo → In Progress → Completed)
Delete resources

Progress Tracking
Automatic progress calculation per goal
Visual progress bars

Activity Logs
Tracks actions like:
Goal creation
Resource addition
Resource completion

Tech Stack

Frontend

Next.js (App Router)
React
TypeScript
Tailwind CSS

Backend / Services

Supabase (Auth, Database, Storage)

Project Structure
app/
 ├── dashboard/       # Main user dashboard
 ├── goals/[id]/      # Goal details & resources
 ├── login/           # Login page
 ├── register/        # Registration page
 ├── profile/         # User profile page
 ├── layout.tsx       # Root layout
 └── page.tsx         # Landing page

components/
 └── Navbar.tsx

lib/
 └── supabase.ts

Setup & Installation
Clone the repository
git clone https://github.com/your-username/skillforge.git
cd skillforge
Install dependencies
npm install
Set up environment variables

Create a .env.local file:

NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
Run the development server
npm run dev

Database Structure (Supabase)
Tables
profiles
id (uuid, PK)
username
full_name
avatar_url
goals
id
title
user_id
resources
id
goal_id
title
type
url
status
activity_logs
id
user_id
action
created_at