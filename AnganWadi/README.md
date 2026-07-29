# AnganWadi - Child Monitoring App

## Full Stack Setup (Backend + MongoDB + Frontend)

### 1. MongoDB Setup (Required)
**Option A: MongoDB Atlas (Recommended for quick start)**
- Go to https://mongodb.com/atlas
- Create free cluster
- Create user/database: anganwadi
- Get connection string: `mongodb+srv://user:pass@cluster.../anganwadi`

**Option B: Local MongoDB (Windows)**
- Download: https://www.mongodb.com/try/download/community
- Install & start service: `mongod`
- DB: anganwadi (auto-created)

### 2. Backend Setup
```
cd backend
copy .env.example .env
# Edit backend/.env:
# MONGODB_URI=your_mongo_uri_here
# JWT_SECRET=supersecretkey123 (change it)
npm install
npm run dev
```
Server: http://localhost:5000

### 3. Frontend
```
npm install
npm run dev
```
App: http://localhost:5173

### 4. Full Development
```
npm run dev:full
```

### 5. Test Flow
1. Backend must connect MongoDB first (check console 'MongoDB Connected')
2. Frontend login/register (admin/parent1 pass: admin123 or register new)
3. Admin: Add child → View children/attendance
4. Parent: View own child dashboard

### APIs
- POST /api/auth/login, /register
- GET/POST/PUT/DEL /api/children
- PUT /api/attendance/:id

### Notes
- Parent role sees only assigned child
- Status calculated via WHO-like thresholds
- Data persists in MongoDB
- JWT auth, 7d expiry
