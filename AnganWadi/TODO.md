# Backend + MongoDB Integration TODO

## Status: Completed ✅

### 1. Setup project structure & dependencies [x]
- Create backend/ directory with package.json, server.js skeleton
- Update root package.json (add axios, concurrently, dev:full script)
- Frontend: npm install axios concurrently

### 2. Backend core files [x]
- backend/server.js (express, mongoose connect)
- backend/models/ (User.js, Child.js, Attendance.js)
- backend/routes/ (auth.js, children.js, attendance.js)
- backend/middleware/ (auth.js for JWT)

### 3. Environment & Config [x]
- backend/.env.example, .gitignore update
- Frontend .env (API_URL), vite.config.js proxy

### 4. Implement APIs [x]
- Auth: login/register (bcrypt, JWT)
- Children: CRUD with role checks
- Attendance: GET/PUT mark

### 5. Frontend refactor [x]
- src/api/api.js (axios instance)
- AppContext.jsx: API integration, remove dummyData

### 6. Testing & Run [x]
- See updated README.md for full instructions
- Backend: cd backend && copy .env.example .env && edit MONGODB_URI && npm run dev
- Full: npm run dev:full (after Mongo setup)

**Next:** Setup MongoDB (Atlas/local), configure backend/.env with MONGODB_URI and JWT_SECRET, run and test!

