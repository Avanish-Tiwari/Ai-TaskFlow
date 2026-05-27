# AI TaskFlow — Portfolio Case Study

## Project Overview

AI TaskFlow is a fullstack productivity application that integrates large language model AI into everyday task management. Users can create, organize, and complete tasks while an AI layer automatically categorizes work, suggests next steps, and provides focused productivity insights.

**Live:** https://ai-task-flow-five.vercel.app
**Code:** https://github.com/Avanish-Tiwari/Ai-TaskFlow

---

## The Problem I Solved

Most todo apps are passive — they store what you tell them and do nothing else. I wanted to build something that actively helps you think. The core question was: what if your task manager could read your workload and tell you what to focus on?

This led to four AI features:
- Auto-categorize any task the moment you add it
- Suggest tasks you might be missing based on current workload
- Give a focused tip for any individual task
- Analyze your full task list and recommend where to start

---

## Technical Decisions

### Why PostgreSQL over MongoDB

Tasks have a clear relationship with users — one user owns many tasks. This is structured, relational data. PostgreSQL with a proper foreign key constraint enforces this at the database level, making it impossible to create orphaned tasks. MongoDB would work too, but a relational model is the right tool for this shape of data.

### Why AI calls go through the backend

A common mistake junior developers make is calling AI APIs directly from React. This exposes the API key in the browser — anyone can open DevTools and steal it. By routing all AI calls through the Express backend, the API key lives only in environment variables on the server and is never visible to the client.

### Why JWT over sessions

JWT is stateless — the server does not store any session data. Every request carries a self-contained token that the server verifies with a secret key. This makes the API horizontally scalable — any number of server instances can verify the same token without sharing session storage. This is how most modern APIs are designed.

### Why Prisma as the ORM

Raw SQL works but is error-prone and verbose. Prisma provides a type-safe query API that maps JavaScript objects directly to database rows. It also manages schema migrations, making it easy to evolve the database structure as the app grows. Running `npx prisma db push` keeps the database in sync with the schema definition automatically.

---

## Challenges and How I Solved Them

### Prisma 7 breaking changes

Prisma version 7 changed how database connections work — the connection URL moved from `schema.prisma` to a new `prisma.config.ts` file, and `PrismaClient` now requires a driver adapter instead of accepting a connection string directly. This caused multiple build failures at first.

The fix required understanding the new adapter pattern, installing `@prisma/adapter-pg`, and updating both the config file and the client initialization. Reading the error messages carefully and tracing them to the exact lines was the key skill here.

### SPA routing 404 on Vercel

After deploying to Vercel, refreshing any page other than the homepage returned a 404. This is a classic React Router issue — Vercel's server tries to find a physical file at `/login` or `/dashboard`, finds nothing, and returns 404. React Router only runs in the browser after `index.html` loads.

The fix was a `vercel.json` rewrite rule telling Vercel to always serve `index.html` for any route and let React Router handle the rest client-side.

### CORS working in Chrome but not Firefox

Chrome is more lenient about some CORS preflight requests. Firefox sends an OPTIONS preflight request before every cross-origin POST and requires an explicit response. Adding `app.options('*', cors())` before the routes handles all preflight requests correctly across all browsers.

---

## System Design Concepts Applied

**Middleware pattern** — The JWT auth middleware runs as a pipeline stage before any protected route handler. Writing it once and applying it to entire route groups (`app.use('/api/tasks', protect, taskRoutes)`) keeps auth logic centralized and consistent.

**Singleton pattern** — A single Prisma client instance is created in `lib/prisma.js` and imported wherever database access is needed. Creating a new client per request would exhaust the database connection pool.

**Interceptor pattern** — Axios request interceptors automatically attach the JWT token to every outgoing API call. This means no route in the frontend needs to manually handle the Authorization header.

**Separation of concerns** — Frontend code is organized into `pages` (full views), `components` (reusable UI), `services` (API calls), and `context` (global state). Each folder has one clear responsibility, making the codebase easy to navigate and extend.

**One-to-Many relationship** — The database schema models a User having many Tasks through a foreign key on the Task table. Prisma enforces referential integrity, preventing tasks from existing without a valid owner.

---

## What I Would Add Next

- **Drag and drop** reordering of tasks
- **Due dates** with overdue detection
- **Team workspaces** — shared task lists with multiple users
- **Email notifications** for upcoming deadlines
- **Rate limiting** on AI endpoints to control costs
- **Redis caching** for AI responses to identical prompts

---

## Resume Bullet Points

Choose 2-3 of these depending on what the job description emphasizes:

> Built a fullstack AI-powered task management app using React, Node.js, Express, and PostgreSQL, integrating the Groq LLM API for smart task categorization, productivity suggestions, and workload analysis

> Designed and implemented a RESTful API with JWT authentication, bcrypt password hashing, and role-based route protection using Express middleware

> Architected a React frontend with Context API for global auth state, Axios interceptors for automatic token attachment, and React Router with private route guards

> Deployed a production fullstack application with React on Vercel and Node.js on Render, configuring environment-specific CORS policies and SPA routing rules

> Solved real production issues including Prisma v7 driver adapter migration, cross-browser CORS preflight handling, and client-side routing 404s on static hosting

---

## Tech Stack Summary

**Frontend:** React 18, Vite, React Router v6, Axios, Context API

**Backend:** Node.js, Express.js, Prisma ORM v7, bcryptjs, jsonwebtoken

**Database:** PostgreSQL hosted on Neon

**AI:** Groq API with Llama 3.3 70B model

**Deployment:** Vercel (frontend), Render (backend)

**Tools:** Thunder Client, Prisma Studio, Git, GitHub
