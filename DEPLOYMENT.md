# Deployment Guide: Vercel (Frontend) + Render (Backend)

## Summary

The app is set up for:
- **Frontend**: Vercel (Vite/React SPA)
- **Backend**: Render (Node/Express)
- **Database**: MongoDB (e.g. Atlas) — set `MONGODB_URI` on Render

---

## 1. Deploy Backend on Render

1. Push your repo to GitHub and connect it to [Render](https://render.com).
2. Create a **Web Service**.
3. **Build & deploy**:
   - **Root Directory**: `Backend`
   - **Build Command**: (leave empty or `npm install`)
   - **Start Command**: `npm start`
   - **Environment**: Node
4. **Environment variables** (in Render dashboard):
   - `PORT` — set by Render; you can leave it unset.
   - `NODE_ENV` = `production`
   - `MONGODB_URI` — your MongoDB connection string (e.g. Atlas).
   - `JWT_SECRET` — a long random string (generate one for production).
   - `JWT_EXPIRES_IN` — e.g. `7d`
   - `CORS_ORIGIN` — your Vercel frontend URL, e.g. `https://your-app.vercel.app` (add this **after** you deploy the frontend).

5. Deploy and copy the backend URL (e.g. `https://ems-tms-backend.onrender.com`).

**Note:** On Render’s free tier the service may spin down after inactivity; the first request after that can take 30–60 seconds.

---

## 2. Deploy Frontend on Vercel

1. Connect your GitHub repo to [Vercel](https://vercel.com).
2. **Project settings**:
   - **Root Directory**: `Frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. **Environment variables**:
   - `VITE_API_URL` = your Render backend URL **without** trailing slash, e.g. `https://ems-tms-backend.onrender.com`
4. Deploy.

---

## 3. Point Frontend to Backend

- **Vercel**: `VITE_API_URL` must be the full Render backend URL (no `/api` suffix; the app adds `/api`).
- **Render**: Set `CORS_ORIGIN` to your Vercel URL (e.g. `https://your-app.vercel.app`) so the browser can call the API. Redeploy the backend after adding it.

---

## 4. Security Checklist

- [ ] Never commit `.env` (already in `.gitignore`).
- [ ] Use a strong, random `JWT_SECRET` in production.
- [ ] Use a production MongoDB URI (e.g. MongoDB Atlas) with a strong password.
- [ ] Keep `CORS_ORIGIN` set to your real frontend URL on Render.

---

## Quick Reference

| Platform | Key env vars |
|----------|----------------|
| **Render (Backend)** | `NODE_ENV`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN` |
| **Vercel (Frontend)** | `VITE_API_URL` (Render backend URL) |
