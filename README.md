# ⚡ ProgressPlus

> Track Tasks. Build Habits. Master Consistency.

A full-stack productivity platform — React + Node.js + MongoDB + Firebase Auth.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20 LTS
- MongoDB Atlas account (free M0 tier)
- Firebase project

### 1. Clone & Install

```bash
git clone https://github.com/guptayash122006/ProgressPlus.git
cd ProgressPlus

# Install frontend
cd client && npm install

# Install backend
cd ../server && npm install
```

### 2. Configure Environment Variables

**Client (`client/.env`):**
```bash
cp client/.env.example client/.env
# Fill in your Firebase config
```

**Server (`server/.env`):**
```bash
cp server/.env.example server/.env
# Fill in MongoDB URI + Firebase Admin credentials
```

### 3. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication** → Sign-in methods: **Google** + **Email/Password**
4. Go to Project Settings → General → Your Apps → Add Web App → copy config to `client/.env`
5. Go to Project Settings → Service Accounts → Generate new private key → use values in `server/.env`

### 4. Run Locally

```bash
# Terminal 1 - Backend
cd server && npm run dev       # http://localhost:5000

# Terminal 2 - Frontend
cd client && npm run dev       # http://localhost:5173
```

---

## 📁 Project Structure

```
ProgressPlus/
├── client/              # React 18 + Vite + Tailwind CSS
│   └── src/
│       ├── pages/       # Route-level pages
│       ├── components/  # UI + layout + feature components
│       ├── hooks/       # React Query hooks
│       ├── store/       # Zustand state stores
│       ├── services/    # API service layer
│       └── lib/         # Firebase, axios, utils
│
├── server/              # Node.js + Express + MongoDB
│   └── src/
│       ├── models/      # Mongoose schemas
│       ├── routes/      # Express routes
│       ├── controllers/ # Business logic
│       ├── middleware/  # Auth, errors, rate limiting
│       └── config/      # DB, Firebase Admin
│
└── docs/                # Additional documentation
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS v3 |
| Animations | Motion (motion/react) |
| Charts | Recharts |
| State | Zustand + React Query |
| Auth | Firebase (Google + Email) |
| Backend | Node.js, Express v5 |
| Database | MongoDB Atlas + Mongoose |
| Deployment | Vercel (client) + Render (server) |

---

## 🌟 Features

- ✅ **Task Management** — Create, edit, delete tasks with priority, category & due dates
- 🔥 **Habit Tracker** — Daily habit logging with streak tracking
- 📊 **Analytics** — Weekly/monthly charts, consistency & accuracy scores
- 🏆 **Gamification** — XP, levels, badges, streaks
- 🛡 **Auth** — Google Sign-In + Email/Password via Firebase
- 🎬 **Onboarding** — 5-step animated walkthrough for new users
- 📱 **Responsive** — Mobile-first design

---

## 🚀 Deploy to Production

### Frontend (Vercel)
```bash
cd client
npm run build
# Deploy dist/ folder to Vercel
```

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repo
3. Set root directory: `server`
4. Start command: `npm start`
5. Add all environment variables from `server/.env`

---

## 📄 License

MIT — Built with AI-assisted development by [@guptayash122006](https://github.com/guptayash122006)
