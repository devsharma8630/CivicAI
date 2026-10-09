# CivicAI

AI-powered civic complaint platform built on Next.js, Supabase and OpenRouter.

## Setup

1. `npm install`
2. Copy `.env.local.example` to `.env.local` and fill every value. `OPENROUTER_MODEL` must be a vision-capable model listed on openrouter.ai.
3. In the Supabase SQL Editor run `database/schema.sql`, then `database/rls.sql`.
4. Create an admin: sign up normally, then run
   `update profiles set role = 'ADMIN' where email = 'you@example.com';`
5. Set `ADMIN_SECRET_CODE` in `.env.local`. It is checked only in `/api/admin/login` on the server.
6. `npm run dev` and open http://localhost:3000

## Implemented

- Database schema, RLS and private image storage policies
- OpenRouter image analysis with Zod validation and fallback
- Complaint creation with image upload, duplicate grouping, priority scoring and notifications
- Admin secret-code login and route protection middleware

## Not yet implemented

Login, signup and dashboard pages, report form, maps, heatmap, admin panel, analytics, summarize and spam routes, seed data.
