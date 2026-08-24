# NEO-HMS — Hospital Management System

A full-stack, role-based Hospital Management System built with **React + Vite** (frontend) and **Express + MongoDB** (backend).

---

## Project Structure

```
NEO_WEB/                        ← Frontend (React + Vite)
├── src/
│   ├── components/             — Reusable UI components
│   ├── contexts/               — React context providers (Auth)
│   ├── layouts/                — App shell (Sidebar, Topbar)
│   ├── pages/                  — Route-level page components
│   ├── routes/                 — React Router configuration
│   ├── services/               — API service layer
│   ├── styles/                 — Global CSS design system
│   └── utils/                  — Frontend utilities
├── .env                        — Frontend environment variables
├── index.html
├── package.json
└── vite.config.js

NEO_WEB/NEO_BACKEND/            ← Backend (Express + MongoDB)
├── src/
│   ├── controllers/            — Request handlers
│   ├── middleware/             — Auth, error handling
│   ├── models/                 — Mongoose schemas
│   ├── routes/                 — Express route definitions
│   └── scripts/seed.js         — Database seeder
├── server.js                   — Entry point
├── .env                        — Backend environment variables
└── package.json
```

---

## Running the Project

Both the **frontend** and **backend** run as separate processes. Open two terminals.

### Terminal 1 — Backend

```bash
cd NEO_WEB/NEO_BACKEND

# Install dependencies (first time only)
npm install

# Configure environment
cp .env.example .env   # then edit MONGO_URI, JWT_SECRET, etc.

# Seed the database (first time, or to reset data)
npm run seed

# Start the backend server (dev mode with hot reload)
npm run dev
```

Backend runs at: **http://localhost:5000**

---

### Terminal 2 — Frontend

```bash
cd NEO_WEB

# Install dependencies (first time only)
npm install

# Start the frontend dev server
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## Login Credentials

After running `npm run seed` in the backend:

| Role              | Email                        | Password    |
|-------------------|------------------------------|-------------|
| Admin             | admin@hospital.com           | password123 |
| Doctor            | doctor@hospital.com          | password123 |
| Nurse             | nurse@hospital.com           | password123 |
| Receptionist      | reception@hospital.com       | password123 |
| Pharmacist        | pharmacy@hospital.com        | password123 |
| Lab Technician    | lab@hospital.com             | password123 |
| Radiologist       | radiology@hospital.com       | password123 |
| Billing           | billing@hospital.com         | password123 |
| Insurance         | insurance@hospital.com       | password123 |
| Complaint Officer | complaint@hospital.com       | password123 |

> **Note:** If MongoDB is unavailable, the frontend automatically falls back to these same credentials using a local mock — the UI remains fully functional either way.

---

## Environment Variables

### Frontend (`.env`)

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_URL=http://localhost:5000/api
```

### Backend (`NEO_BACKEND/.env`)

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/neo_hms
JWT_SECRET=your_strong_secret_here
JWT_EXPIRES_IN=8h
CLIENT_URL=http://localhost:5173
```

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 19, Vite 8, React Router 7 |
| Styling   | Vanilla CSS (custom design system)|
| Charts    | Recharts                          |
| Backend   | Node.js, Express 5                |
| Database  | MongoDB, Mongoose 9               |
| Auth      | JWT, bcryptjs                     |
| Security  | Helmet, CORS, express-rate-limit  |

---

## Features

- **Role-Based Access Control** — 10+ roles (Admin, Doctor, Nurse, Receptionist, etc.)
- **Patient Management** — Registration, profiles, medical history
- **Appointments** — Scheduling, status tracking
- **IPD / Bed Management** — Admissions, bed occupancy
- **Laboratory & Radiology** — Orders, results
- **Pharmacy** — Prescriptions, inventory
- **Billing & Insurance** — Invoicing, claims
- **Emergency & Surgery** — Real-time registration
- **Dashboard** — Role-specific KPIs, census, activity feed
- **Audit Trail** — Full traceability of system events
