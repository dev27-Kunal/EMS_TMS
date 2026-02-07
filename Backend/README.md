# EMS-TMS Backend

Node.js + Express + MongoDB backend for the Employee & Task Management System.

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set:
   - `MONGODB_URI` - MongoDB connection string
   - `JWT_SECRET` - Secret for JWT signing (change in production)

3. **Seed the database**
   ```bash
   npm run seed
   ```
   Creates demo data including 5 users. Default password: `password123`

4. **Start the server**
   ```bash
   npm run dev   # Development (with watch)
   npm start     # Production
   ```

Server runs at `http://localhost:5000` by default.

## API Endpoints

| Module | Endpoints |
|--------|-----------|
| Auth | `POST /api/auth/login`, `/logout`, `/forgot-password`, `/reset-password`, `/change-password` |
| Employees | `GET/POST /api/employees`, `GET/PUT /api/employees/:id` |
| Departments | `GET/POST /api/departments`, `GET/PUT /api/departments/:id` |
| Roles | `GET/POST /api/roles`, `GET/PUT /api/roles/:id` |
| Jobs | `GET/POST /api/jobs`, `GET/PUT /api/jobs/:id`, `POST /api/jobs/:id/assign`, `GET /api/jobs/:id/history` |
| Approvals | `GET /api/approvals`, `GET /api/approvals/:id`, `POST /api/approvals/:id/approve`, `POST /api/approvals/:id/reject` |
| Profile | `GET/PUT /api/profile` |
| Notifications | `GET /api/notifications`, `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/read-all`, `GET/PUT /api/notifications/settings` |
| Login History | `GET /api/login-history`, `GET /api/login-history/:id` |

All routes except auth login/forgot/reset require `Authorization: Bearer <token>`.

## Demo Login

| Email | Role | Password |
|-------|------|----------|
| admin@company.com | System Admin | password123 |
| hr@company.com | HR Admin | password123 |
| gm@company.com | General Manager | password123 |
| supervisor@company.com | Supervisor | password123 |
| employee@company.com | Employee | password123 |
