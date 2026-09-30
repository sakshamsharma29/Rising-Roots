# Rising Roots - Full-Stack Trading Community Platform Documentation

Welcome to the official documentation for **Rising Roots**, a full-stack community management platform built for stock, crypto, and options trading communities.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Folder & Workspace Architecture](#folder--workspace-architecture)
3. [User Roles & Access Control (RBAC)](#user-roles--access-control-rbac)
4. [Core Features & Functionalities](#core-features--functionalities)
5. [Database Schema (SQLite)](#database-schema-sqlite)
6. [API Endpoints Reference](#api-endpoints-reference)
7. [Installation & Setup Guide](#installation--setup-guide)
8. [Production Deployment Checklist](#production-deployment-checklist)

---

## 1. Project Overview

Rising Roots is designed to help trading community leaders manage subscriber memberships, automate Telegram/Discord private channel access, track monthly recurring revenue (MRR), and broadcast real-time trading signals.

### Key Highlights
- **Full-Stack Monorepo**: Separated `frontend/` (React 19 + Vite 8 + Tailwind CSS) and `backend/` (Node.js v24 + Express + built-in SQLite).
- **Security**: Password encryption via `bcryptjs` and 7-day session security via **JSON Web Tokens (JWT)**.
- **Persistence**: Self-contained SQLite database (`database.sqlite`) via Node's native `node:sqlite`.
- **Responsive Theme**: Tailored dark-mode UI designed for financial traders.

---

## 2. Folder & Workspace Architecture

```text
Rising-Roots/
├── .git/                      # Git tracking directory
├── .gitignore                 # Consolidated git ignore rules
├── README.md                  # Quickstart guide
├── DOCUMENTATION.md           # Full system documentation
├── package.json               # Workspace scripts (npm run dev:frontend, etc.)
│
├── frontend/                  # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx     # Top search bar, profile, add member trigger
│   │   │   └── Sidebar.jsx    # Role-based icon navigation bar
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx# Public homepage (Hero, Features, Pricing, CTA)
│   │   │   ├── AuthPage.jsx   # Login & Signup screen with JWT auth
│   │   │   ├── Dashboard.jsx  # Admin Control Center overview & metrics
│   │   │   ├── Members.jsx    # Member table, status filters & add modal
│   │   │   ├── Plans.jsx      # Pricing tier builder & perks manager
│   │   │   ├── Analytics.jsx  # Revenue trend charts, MRR & churn stats
│   │   │   ├── Settings.jsx   # Telegram bot token & webhook configuration
│   │   │   └── UserPortal.jsx # Member subscriber portal & live signals feed
│   │   ├── App.jsx            # Protected routes & role-based layout
│   │   ├── main.jsx           # Vite entrypoint
│   │   └── index.css          # Tailwind CSS directives
│   ├── public/                # Static public web assets
│   ├── legacy/                # Preserved static HTML landing page
│   ├── package.json           # Frontend dependencies
│   ├── vite.config.js         # Vite configuration
│   └── tailwind.config.js     # Tailwind CSS configuration
│
└── backend/                   # Node.js + Express Backend API
    ├── database.sqlite        # SQLite persistent database file
    ├── src/
    │   ├── db.js              # SQLite database initialization & migrations
    │   ├── middleware/
    │   │   └── authMiddleware.js # JWT verification middleware
    │   ├── controllers/
    │   │   ├── authController.js    # Register, login & profile lookup
    │   │   ├── membersController.js # Member CRUD, search, filter & stats
    │   │   ├── plansController.js   # Pricing plan data
    │   │   ├── paymentController.js # Order creation & webhook listeners
    │   │   └── analyticsController.js# MRR & retention metrics
    │   ├── services/
    │   │   └── telegramBot.js # Telegram channel broadcast & link generator
    │   ├── routes/
    │   │   ├── auth.js        # Authentication endpoints (/api/auth)
    │   │   ├── payment.js     # Checkout & webhook endpoints (/api/payments)
    │   │   └── api.js         # Protected data endpoints (/api)
    │   └── server.js          # Express app entrypoint
    ├── .env.example           # Environment variables template
    └── package.json           # Backend dependencies
```

---

## 3. User Roles & Access Control (RBAC)

The application enforces strict **Role-Based Access Control (RBAC)** across frontend routes and backend APIs.

| Role | Access Level | Available Views & Features |
|------|--------------|----------------------------|
| **Admin** (`role: 'admin'`) | Full Administrator | Full Control Center, Members management, Pricing tier editor, Analytics, Broadcast alerts, Bot settings |
| **User / Member** (`role: 'user'`) | Subscriber Access | Member Portal (`UserPortal.jsx`), Plan status, Telegram VIP link, Live Trading Signals feed |

### Default Accounts
- **Pre-configured Admin**: `admin@risingroots.com` / `admin123`
- **Public Signups**: Any user registering via `/login?mode=signup` receives the `user` (Member) role by default.

---

## 4. Core Features & Functionalities

### Public Landing Page (`/`)
- **Hero Section**: Value proposition and live overview preview.
- **Features Grid**: Outlines member management, bot automation, revenue analytics, and broadcast alerts.
- **Pricing Tiers**: Starter (Free), Pro (₹1,999/mo), and Enterprise tiers.

### Authentication (`/login`)
- **Dual Mode**: Split-panel interface supporting both Login and Signup.
- **Password Security**: Passwords hashed using `bcryptjs` (salt rounds: 10).
- **Session Tokens**: Issues 7-day signed JWT tokens stored in `localStorage`.

### Admin Dashboard (`/dashboard`)
- **Key Metrics**: Real-time tracking of Total Members, Monthly Revenue (MRR), Active Subscriptions, and Expired Plans.
- **Broadcast Announcements**: Send trade alerts directly to connected Telegram/Discord channels.
- **Activity Log**: Real-time audit trail of plan upgrades, member joins, and renewals.

### Member Management (`/dashboard/members`)
- **Live Search & Filter**: Search members by name, email, or plan. Filter by status (`All`, `Active`, `Expired`).
- **Add Member Modal**: Add new community members manually.
- **Access Control**: Revoke or renew subscriber access with a single click.

### Member Portal (`/dashboard`)
- **Live Signals Feed**: Options trading ideas (NIFTY, BANKNIFTY) with Entry, Target, and Stoploss metrics.
- **Telegram VIP Link**: Direct invite link generator for private signal groups.
- **Plan Renewal**: View remaining subscription days and trigger renewal.

---

## 5. Database Schema (SQLite)

Database file location: `backend/database.sqlite`

### `users` Table
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | User ID |
| `name` | TEXT | NOT NULL | User full name |
| `email` | TEXT | UNIQUE NOT NULL | User email address |
| `password_hash` | TEXT | NOT NULL | Bcrypt hashed password |
| `role` | TEXT | DEFAULT 'admin' | User role (`admin` or `user`) |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |

### `members` Table
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Member ID |
| `name` | TEXT | NOT NULL | Member name |
| `email` | TEXT | UNIQUE NOT NULL | Member email |
| `plan` | TEXT | NOT NULL | Plan tier name |
| `status` | TEXT | DEFAULT 'Active' | Access status (`Active` / `Expired`) |
| `joined_date` | TEXT | NOT NULL | ISO date string |

### `plans` Table
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Plan ID (`pro`, `vip`, `starter`) |
| `name` | TEXT | NOT NULL | Plan display name |
| `price` | TEXT | NOT NULL | Formatted price string |
| `subscribers` | INTEGER | DEFAULT 0 | Subscriber count |
| `status` | TEXT | DEFAULT 'Active' | Availability status |
| `features` | TEXT | NOT NULL | JSON string array of perks |

---

## 6. API Endpoints Reference

### Authentication Endpoints
- `POST /api/auth/register` — Register a new user (`{ name, email, password }`)
- `POST /api/auth/login` — Authenticate user (`{ email, password }`) -> Returns `{ token, user }`
- `GET /api/auth/me` — Fetch currently authenticated user (Requires `Authorization: Bearer <token>`)

### Members Endpoints
- `GET /api/members` — Fetch members (Supports `?search=` and `?status=`)
- `POST /api/members` — Create member (`{ name, email, plan, status }`)
- `PATCH /api/members/:id/toggle` — Toggle status between `Active` and `Expired`

### Dashboard & Analytics Endpoints
- `GET /api/stats` — Fetch total members, active, expired, and monthly revenue
- `GET /api/plans` — Fetch pricing tiers and perks
- `GET /api/analytics` — Fetch MRR growth trends and renewal rates
- `POST /api/broadcast` — Broadcast message to Telegram channel (`{ message }`)

### Payment & Webhook Endpoints
- `POST /api/payments/create-order` — Create payment order payload
- `POST /api/payments/webhook` — Process Razorpay/Stripe payment events

---

## 7. Installation & Setup Guide

### Prerequisites
- Node.js v24.x (or v20.x+)
- npm 10.x+

### Quick Start

1. **Clone & Navigate**:
   ```bash
   git clone <repo-url>
   cd Rising-Roots
   ```

2. **Install Backend Dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```

4. **Run Application**:
   - **Terminal 1 (Backend)**: `npm run dev:backend` (from root) → `http://localhost:5000`
   - **Terminal 2 (Frontend)**: `npm run dev:frontend` (from root) → `http://localhost:5173`

---

## 8. Production Deployment Checklist

- [x] Configure `.env` in `backend/` with `JWT_SECRET` and `TELEGRAM_BOT_TOKEN`.
- [x] Run `npm run build --prefix frontend` to generate static bundle in `frontend/dist/`.
- [x] Deploy backend to Node hosting (Render, Railway, DigitalOcean, or AWS EC2).
- [x] Deploy frontend static build to Vercel, Netlify, or Cloudflare Pages.
- [x] Point payment webhook URLs (Stripe / Razorpay) to `https://your-domain.com/api/payments/webhook`.
