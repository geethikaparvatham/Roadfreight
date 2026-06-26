# Road Freight Consignment Status & ETA Dashboard

## Overview
This is an enterprise-grade web application built for Road Freight Logistics & Transportation Management. It features a multi-tenant architecture, supporting multiple logistics companies (e.g., HK Shipping, ABC Logistics) in a single platform with data isolation.

## Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Shadcn UI, Recharts, Mapbox GL JS, Zustand.
- **Backend**: Node.js, Express.js, TypeScript, Socket.IO, Prisma ORM.
- **Database**: PostgreSQL (via Neon).

## Folder Structure
```
road-freight-dashboard/
├── backend/                  # Node.js + Express + Prisma API
│   ├── prisma/               # Database Schema and migrations
│   ├── src/
│   │   ├── controllers/      # Route handlers (auth, consignments, etc.)
│   │   ├── middlewares/      # JWT, RBAC auth middleware
│   │   ├── routes/           # Express routers
│   │   ├── utils/            # Helper functions
│   │   ├── app.ts            # Express app configuration
│   │   └── index.ts          # Server & Socket.IO entry point
│   └── package.json
└── frontend/                 # Next.js 15 App
    ├── src/
    │   ├── app/              # Next.js App Router (login, dashboard, etc.)
    │   ├── components/       # Shadcn UI & Custom Components
    │   ├── store/            # Zustand global state (Auth)
    │   └── lib/              # Utility functions
    ├── tailwind.config.ts    # Tailwind Configuration
    └── package.json
```

## Quick Start (Local Development)

### 1. Database Setup
You will need a PostgreSQL database. You can use a local Docker container or a cloud provider like Neon.
1. Update `backend/.env` with your `DATABASE_URL`.
2. Run Prisma migrations:
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   ```

### 2. Start Backend Server
```bash
cd backend
npm run dev
```
The server will run on `http://localhost:5000`.

### 3. Start Frontend Server
```bash
cd frontend
npm run dev
```
The Next.js app will run on `http://localhost:3000`.

## Deployment Guide

### Frontend (Vercel)
1. Push your code to GitHub.
2. Go to Vercel and import the `frontend` directory.
3. Configure Environment Variables (e.g., `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_MAPBOX_KEY`).
4. Deploy.

### Backend (Railway / Render)
1. In Railway, link your GitHub repo and select the `backend` folder as the root.
2. Add a PostgreSQL database add-on in Railway.
3. Add Environment Variables:
   - `DATABASE_URL` (From Railway Postgres)
   - `JWT_SECRET`
   - `PORT=5000`
4. Set the Start Command: `npm run build && npm start`
5. Deploy.
