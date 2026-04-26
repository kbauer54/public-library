# Public Library Management System

A full-stack web application for managing a public library's catalog, events, patrons, and staff.

## Demo Credentials

### Patron Login
- **Email:** dkalewe0@apple.com
- **Password:** password

### Staff Login
- **Email:** alongstreeth0@toplist.cz
- **Password:** password

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MySQL (hosted on Railway)

## Prerequisites

- Node.js v18+
- npm

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd public-library-management-system
```

### 2. Set up the backend

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and fill in the database credentials (get these from a team member or the Railway dashboard).

```bash
npm install
npm run start
```

The backend will run on **http://localhost:3000**

### 3. Set up the frontend

Open a new terminal tab:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The frontend will run on **http://localhost:5173/Public-Library/**

## Environment Variables

### backend/.env

| Variable | Description |
|----------|-------------|
| DB_HOST | Railway MySQL host |
| DB_PORT | Railway MySQL port |
| DB_USER | Database username |
| DB_PASSWORD | Database password |
| DB_NAME | Database name |
| JWT_SECRET | Secret key for JWT authentication |

### frontend/.env

| Variable | Description |
|----------|-------------|
| VITE_API_URL | Backend API URL (http://localhost:3000 for local dev) |

## Project Structure

```
public-library-management-system/
├── backend/
│   ├── routes/         # API route handlers
│   ├── db.js           # Database connection
│   ├── index.js        # Express server entry point
│   └── .env.example    # Environment variable template
├── frontend/
│   ├── src/
│   │   ├── api/        # API client functions
│   │   ├── app/        # React components and pages
│   │   └── main.tsx    # App entry point
│   └── .env.example    # Environment variable template
└── README.md
```

## Features

- 📚 Book catalog with search and filtering
- 🗓️ Library events browser
- 👤 Patron login and account management
- 🏛️ Multi-branch support
