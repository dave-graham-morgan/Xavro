# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Xavro is an escape room booking management system. Staff manage rooms, showtimes, pricing, customers, and bookings through a React SPA backed by a Flask REST API with PostgreSQL.

## Development Commands

### Backend (Flask, port 8080)
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend (Vite/React, port 5173)
```bash
cd frontend
npm install
npm run dev
npm run build
npm run lint
```

### Database
No migration tool is used — tables are auto-created on app startup via `db.create_all()`. To reset, drop and recreate the `xavro_dev` PostgreSQL database locally.

### Environment
- Backend: copy `.env` and set `SQLALCHEMY_DEV_DATABASE_URI`, `JWT_SECRET_KEY`, `ALLOWED_ORIGINS`
- Frontend: `.env.development` sets `VITE_API_BASE_URL=http://localhost:8080/` (already committed)
- Set `ENVIRONMENT=DEV` in backend `.env` to use dev database config

## Architecture

### Backend (`backend/`)
Flask app using blueprints registered under `/api/*` (except auth routes, which are at root `/`):

- `app.py` — app factory: initializes Flask, SQLAlchemy, JWT, CORS, and registers blueprints
- `config.py` — `DevelopmentConfig` / `ProductionConfig` selected by `ENVIRONMENT` env var
- `app_files/models.py` — all SQLAlchemy models
- `app_files/services.py` — business logic (availability calculation, timeslot resolution)
- `app_files/utils.py` — enums: `UserRoles` (ADMIN=1, EMPLOYEE=0, GUEST=3), `PaymentStatus`
- `app_files/routes/` — one blueprint per resource: `auth`, `rooms`, `showtimes`, `bookings`, `customers`

Key model relationships:
- `Room` → `Showtime` (recurring schedule by `day_of_week` 0–6, `timeslot` int)
- `Room` → `RoomCost` (pricing tiers by `guests_count` with date ranges)
- `Room` → `SpecialSchedule` (closures/maintenance for a specific date)
- `Booking` → `Room` + `Customer` (tracks `show_date`, `show_timeslot`, `guest_count`)
- `Booking` → `Payments`

Availability logic lives in `services.py`: it iterates the next N days (configured by `NUM_OF_DAYS_TO_CHECK_AVAILABILITY`, default 30) and checks showtimes against existing bookings and special schedules.

### Frontend (`frontend/src/`)
React Router SPA. All routes and top-level state are in `App.jsx`. Components are organized by feature in `Components/`:

- `Auth/` — login/register
- `Room/`, `RoomCost/`, `Showtime/` — room management CRUD
- `Booking/` — booking creation and list
- `Customer/` — customer management
- `Calendar/` — date picker using react-calendar; fetches availability then timeslots
- `Navigation/NavBar.jsx` — global nav

API base URL is read from `import.meta.env.VITE_API_BASE_URL`. JWT token is sent as a Bearer token in the `Authorization` header.

### Authentication
- `POST /login` returns a JWT; `POST /register` creates a GUEST-role user
- Protected Flask routes use `@jwt_required()` from Flask-JWT-Extended
- Logout is stateless (client-side token removal); no token blacklist exists

### Production
- Backend deployed to Render.com at `https://xavro.onrender.com/`
- Frontend `.env.production` points to this URL
