# TeamSync — RBAC Team Management System

A full-stack MERN application with Role-Based Access Control (RBAC).

## Tech Stack
- **Backend**: Node.js + Express + MongoDB + Mongoose + JWT
- **Frontend**: React 18 + Vite + TailwindCSS + React Router v6

## Project Structure

```
rbac-app/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Register, login, me
│   │   ├── userController.js     # CRUD users
│   │   ├── teamController.js     # CRUD teams + members list
│   │   ├── roleController.js     # CRUD roles + permissions
│   │   └── membershipController.js # Add/remove members, assign roles, resolve permissions
│   ├── middleware/
│   │   ├── auth.js               # JWT protect middleware + generateToken
│   │   └── error.js              # Global error handler
│   ├── models/
│   │   ├── User.js               # name, email, password (hashed)
│   │   ├── Team.js               # name, description, color, createdBy
│   │   ├── Permission.js         # name, description, category
│   │   ├── Role.js               # name, description, color, permissions[]
│   │   └── TeamMembership.js     # user + team + roles[] (core RBAC mapping)
│   ├── routes/
│   │   ├── auth.js               # POST /register, /login; GET /me
│   │   ├── users.js              # GET/PUT/DELETE /users
│   │   ├── teams.js              # CRUD /teams, GET /teams/:id/members
│   │   ├── roles.js              # CRUD /roles + /roles/permissions
│   │   └── memberships.js        # Add/remove/update members, get permissions
│   ├── seed.js                   # Seed demo data
│   ├── server.js                 # Entry point
│   └── .env                      # Environment variables
└── frontend/
    └── src/
        ├── context/AuthContext.jsx     # JWT auth via sessionStorage
        ├── utils/api.js               # Axios instance with JWT interceptor
        ├── components/
        │   ├── Layout.jsx             # Sidebar navigation
        │   └── Modal.jsx              # Reusable modal
        └── pages/
            ├── Dashboard.jsx          # Stats overview
            ├── UsersPage.jsx          # User list + create + delete
            ├── TeamsPage.jsx          # Teams + member management + role assignment
            ├── RolesPage.jsx          # Roles + permission assignment
            ├── PermissionsPage.jsx    # Permission CRUD by category
            └── PermissionExplorer.jsx # Select user+team → see resolved permissions
```

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally on port 27017

### 1. Backend

```bash
cd backend
npm install
# Edit .env if needed (MONGODB_URI, JWT_SECRET)
node seed.js        # Seed demo data (optional)
npm run dev         # Starts on port 5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev         # Starts on port 5173
```

Open http://localhost:5173

## Demo Accounts (after seeding)

| User | Email | Password | Role in Alpha | Role in Beta |
|------|-------|----------|---------------|--------------|
| Alice Admin | alice@demo.com | password123 | Admin | Viewer |
| Bob Manager | bob@demo.com | password123 | Manager | Admin |
| Carol Dev | carol@demo.com | password123 | Developer | Developer + Manager |
| Dave Viewer | dave@demo.com | password123 | Viewer | — |

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Get JWT token |
| GET | /api/auth/me | Current user |
| GET | /api/users | List users (search, pagination) |
| POST | /api/teams | Create team |
| GET | /api/teams | List teams |
| GET | /api/teams/:id/members | Team members with roles |
| POST | /api/teams/:teamId/members | Add user to team |
| DELETE | /api/teams/:teamId/members/:userId | Remove user |
| PUT | /api/teams/:teamId/members/:userId/roles | Update user roles in team |
| GET | /api/teams/:teamId/members/:userId/permissions | **Resolve permissions** |
| GET | /api/users/:userId/teams | User's team memberships |
| POST | /api/roles | Create role |
| GET | /api/roles | List roles with permissions |
| PUT | /api/roles/:id/permissions | Assign permissions to role |
| POST | /api/roles/permissions | Create permission |
| GET | /api/roles/permissions | List all permissions |

## RBAC Data Model

```
User ──────┐
           ▼
TeamMembership (user + team + roles[])
           │
Team ──────┘
           │
           └─► Role ──► Permission[]
```

Key design: A user can have **different roles in different teams**. Permissions are resolved dynamically from all roles in the given team context.

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rbac_team_mgmt
JWT_SECRET=your_secret_here
JWT_EXPIRE=7d
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=TeamSync RBAC
```
