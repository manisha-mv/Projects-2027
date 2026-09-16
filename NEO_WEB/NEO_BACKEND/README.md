# NEO-HMS Backend

Express.js + MongoDB REST API for the NEO Hospital Management System.

---

## Quick Start

### 1. Install Dependencies
```bash
cd NEO_BACKEND
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and update values:
```bash
cp .env.example .env
```

| Variable        | Default                               | Description                    |
|-----------------|---------------------------------------|--------------------------------|
| `NODE_ENV`      | `development`                         | Environment mode               |
| `PORT`          | `5000`                                | Server port                    |
| `MONGO_URI`     | `mongodb://localhost:27017/neo_hms`   | MongoDB connection string       |
| `JWT_SECRET`    | *(change this in production!)*        | JWT signing secret             |
| `JWT_EXPIRES_IN`| `8h`                                  | Token expiry duration          |
| `CLIENT_URL`    | `http://localhost:5173`               | CORS allowed frontend origin   |

### 3. Seed the Database
Populates all users (12 roles), sample patients, beds, and audit logs:
```bash
npm run seed
```

### 4. Start the Server
```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

The API will be available at: **http://localhost:5000**

---

## Login Credentials (after seeding)

| Role              | Email                        | Password       |
|-------------------|------------------------------|----------------|
| Admin             | admin@hospital.com           | password123    |
| Doctor            | doctor@hospital.com          | password123    |
| Nurse             | nurse@hospital.com           | password123    |
| Receptionist      | reception@hospital.com       | password123    |
| Pharmacist        | pharmacy@hospital.com        | password123    |
| Lab Technician    | lab@hospital.com             | password123    |
| Radiologist       | radiology@hospital.com       | password123    |
| Billing           | billing@hospital.com         | password123    |
| Insurance         | insurance@hospital.com       | password123    |
| Complaint Officer | complaint@hospital.com       | password123    |
| Super Admin       | superadmin@neo-hms.com       | SuperAdmin@2026|

---

## API Overview

**Base URL:** `http://localhost:5000/api`

### Health Check
```
GET /api/health
```

### Authentication
```
POST /api/auth/login      — Login (returns JWT token)
POST /api/auth/logout     — Logout
GET  /api/auth/me         — Get current user profile
```

### Core Modules
| Module         | Base Path             |
|----------------|-----------------------|
| Patients       | `/api/patients`       |
| Appointments   | `/api/appointments`   |
| Dashboard      | `/api/dashboard`      |
| Doctors        | `/api/doctors`        |
| IPD / Beds     | `/api/ipd`            |
| Laboratory     | `/api/laboratory`     |
| Radiology      | `/api/radiology`      |
| Pharmacy       | `/api/pharmacy`       |
| Nursing        | `/api/nursing`        |
| Billing        | `/api/billing`        |
| Insurance      | `/api/insurance`      |
| Emergency      | `/api/emergency`      |
| Surgery        | `/api/surgery`        |
| Blood Bank     | `/api/blood-bank`     |
| Discharge      | `/api/discharges`     |
| Follow-Up      | `/api/followups`      |
| Complaints     | `/api/complaints`     |
| Departments    | `/api/departments`    |
| Staff          | `/api/staff`          |
| Notifications  | `/api/notifications`  |
| Settings       | `/api/settings`       |
| Reports        | `/api/reports`        |
| EMR            | `/api/emr`            |
| Traceability   | `/api/traceability`   |
| Audit Logs     | `/api/audit`          |
| Users          | `/api/users`          |

---

## Architecture

```
NEO_BACKEND/
├── src/
│   ├── app.js              — Express app setup (middleware, routes)
│   ├── config/
│   │   └── db.js           — MongoDB connection
│   ├── controllers/        — Route handler logic
│   ├── middleware/
│   │   ├── auth.js         — JWT auth middleware
│   │   └── errorHandler.js — Global error handling
│   ├── models/             — Mongoose schema definitions
│   ├── routes/             — Express router definitions
│   ├── scripts/
│   │   └── seed.js         — Database seed script
│   └── utils/              — Shared utilities
├── server.js               — Entry point (connects DB, starts server)
├── .env                    — Environment variables (git-ignored)
└── package.json
```

---

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js v5
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Security**: Helmet, CORS, express-rate-limit
- **Validation**: express-validator
- **Logging**: Morgan
