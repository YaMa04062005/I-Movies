# IMovies — Cinema Booking & Management System

IMovies is a full-stack, enterprise-grade cinema ticketing and theater management web application built with Node.js, Express, MongoDB (Mongoose), and React (Vite). It features real-time visual seat reservation, atomic concurrency safety, role-based authorization, dynamic pricing tiers, and administrative analytics.

---

## Architecture Overview

```mermaid
graph TD
    User["Customer / Admin Browser"] -->|HTTP / REST + Bearer Token| Frontend["React 19 + Vite Frontend (Port 5173 / 4173)"]
    Frontend -->|Axios /api Proxy| Backend["Express.js Server (Port 5000)"]
    Backend -->|JWT Auth & Authorization| Middleware["Auth & Role Guards"]
    Backend -->|Mongoose ODM| DB[("MongoDB (External or Embedded Fallback)")]
    Backend -->|Aggregation Pipelines| Analytics["Dashboard Statistics"]
```

---

## Database Entity-Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ BOOKING : places
    MOVIE ||--o{ SHOWTIME : features
    CINEMA ||--|{ SCREEN : contains
    CINEMA ||--o{ SHOWTIME : hosts
    SHOWTIME ||--o{ BOOKING : receives

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        string role "user | admin"
        date createdAt
    }

    MOVIE {
        ObjectId _id PK
        string title
        string description
        string_array genre
        number duration
        string rating "G | PG | PG-13 | R | NC-17"
        date releaseDate
        string posterUrl
        string director
        string_array cast
        string language
        string status "now_showing | coming_soon | ended"
    }

    CINEMA {
        ObjectId _id PK
        string name
        string location
        string city
        screen_array screens
    }

    SCREEN {
        number screenNumber
        string name
        number rows
        number seatsPerRow
        seat_type_array seatTypes
    }

    SHOWTIME {
        ObjectId _id PK
        ObjectId movie FK
        ObjectId cinema FK
        number screenIndex
        date dateTime
        date endTime
        pricing_array pricing
        string_array bookedSeats
        string status "scheduled | cancelled | completed"
    }

    BOOKING {
        ObjectId _id PK
        ObjectId user FK
        ObjectId showtime FK
        string_array seats
        number totalPrice
        string status "confirmed | cancelled"
        string bookingReference UK
        date createdAt
    }
```

---

## Seat Booking Concurrency Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Alice as Customer 1
    actor Bob as Customer 2
    participant API as Express API (/api/bookings)
    participant DB as MongoDB (Showtime Collection)

    Note over Alice, Bob: Both Alice and Bob select Seat B5 simultaneously
    Alice->>API: POST /api/bookings { showtimeId, seats: ["B5"] }
    Bob->>API: POST /api/bookings { showtimeId, seats: ["B5"] }

    API->>DB: findOneAndUpdate({ _id: showtimeId, bookedSeats: { $nin: ["B5"] } }, { $addToSet: { bookedSeats: "B5" } })
    Note over DB: Atomic check-and-set executes first for Alice
    DB-->>API: Returns updated showtime (Alice succeeds)
    API->>DB: Booking.create({ user: Alice, seats: ["B5"], status: "confirmed" })
    API-->>Alice: 201 Created (Booking Reference: IMV-XXXXXX)

    API->>DB: findOneAndUpdate({ _id: showtimeId, bookedSeats: { $nin: ["B5"] } }, { $addToSet: { bookedSeats: "B5" } })
    Note over DB: Condition $nin fails because "B5" is already present
    DB-->>API: Returns null (Bob's condition not met)
    API-->>Bob: 409 Conflict ("One or more seats are already booked")
```

---

## Features

### Customer Experience
- **Interactive Visual Seat Map**: Auditory layouts with tiered pricing (Standard, Premium, VIP), screen orientation banner, and seat availability indicator.
- **Real-Time Price Calculations**: Dynamic checkout subtotal reflecting selected seat categories and quantities.
- **Race Condition Prevention**: Atomic MongoDB operations prevent duplicate bookings under high concurrency.
- **Instant Booking Confirmation**: Digital e-ticket summary with unique alphanumeric reference code (`IMV-XXXXXXXX`).
- **My Bookings Ledger**: Live booking history with one-click cancellation and immediate seat release back to the pool.
- **Responsive Dark Theme**: Mobile-first design optimized for phones, tablets, and desktop displays.

### Administrator Capabilities
- **Database-Backed Analytics**: Real-time KPI tiles for revenue, total bookings, active/cancelled reservations, and active screenings.
- **Top Performing Movies**: Dynamic aggregation breakdown of revenue and ticket sales per title.
- **Full Movie CRUD**: Add new releases, manage posters, update synopses, and adjust runtime schedules.
- **Theater & Screen Designer**: Multi-screen multiplex configuration with customizable row/column dimensions and tier assignments.
- **Screening Scheduler**: Assign titles to auditoriums with date-time scheduling and custom pricing models.
- **Global Booking Oversight**: Inspect and cancel customer reservations across all venues.

---

## Project Structure

```
Imovies/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connection with embedded MongoMemoryServer fallback
│   ├── middleware/
│   │   ├── asyncHandler.js       # Asynchronous exception wrapper
│   │   ├── auth.js               # JWT Bearer token verification
│   │   ├── authorize.js          # Role-based access control (RBAC)
│   │   └── errorHandler.js       # Global structured error handler
│   ├── models/
│   │   ├── Booking.js            # Booking schema with auto reference generation
│   │   ├── Cinema.js             # Cinema & Screen subdocument schema
│   │   ├── Movie.js              # Movie catalog schema with validation
│   │   ├── Showtime.js           # Screening schedule with atomic bookedSeats
│   │   └── User.js               # User schema with bcrypt password hashing
│   ├── routes/
│   │   ├── auth.js               # /api/auth (register, login, me)
│   │   ├── bookings.js           # /api/bookings (create, list, cancel, admin/all)
│   │   ├── cinemas.js            # /api/cinemas (CRUD)
│   │   ├── dashboard.js          # /api/dashboard/stats (analytics aggregation)
│   │   ├── movies.js             # /api/movies (CRUD & filters)
│   │   └── showtimes.js          # /api/showtimes (CRUD & scheduling)
│   ├── tests/
│   │   ├── setup.js              # MongoMemoryServer Jest test harness
│   │   ├── auth.test.js          # Authentication endpoint tests
│   │   ├── booking.test.js       # Booking concurrency & cancellation tests
│   │   └── movies.test.js        # Catalog & RBAC tests
│   ├── .env                      # Active backend environment variables
│   ├── .env.example              # Template backend environment variables
│   ├── package.json              # Backend dependencies and scripts
│   ├── seed.js                   # Standalone seeding script
│   ├── seedHelper.js             # Seed data generator helper
│   └── server.js                 # Express server bootstrap
├── frontend/
│   ├── public/                   # Static icons and assets
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js          # Axios client with interceptors
│   │   ├── components/
│   │   │   ├── booking/
│   │   │   │   └── SeatMap.jsx   # Visual seat matrix component
│   │   │   ├── common/
│   │   │   │   ├── AdminRoute.jsx
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   ├── ErrorMessage.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   ├── MovieCard.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   └── layout/
│   │   │       ├── Footer.jsx
│   │   │       ├── Layout.jsx
│   │   │       └── Navbar.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Authentication context provider
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── ManageBookings.jsx
│   │   │   │   ├── ManageCinemas.jsx
│   │   │   │   ├── ManageMovies.jsx
│   │   │   │   └── ManageShowtimes.jsx
│   │   │   ├── BookingConfirmation.jsx
│   │   │   ├── CinemaDetail.jsx
│   │   │   ├── Cinemas.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MovieDetail.jsx
│   │   │   ├── Movies.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── SeatSelection.jsx
│   │   │   └── Showtimes.jsx
│   │   ├── styles/               # CSS modules & design tokens
│   │   ├── App.jsx               # Application routes
│   │   └── main.jsx              # React DOM entry point
│   ├── .env                      # Active frontend environment variables
│   ├── .env.example              # Template frontend environment variables
│   ├── package.json              # Frontend dependencies and scripts
│   └── vite.config.js            # Vite build and proxy configuration
├── PROJECT_PLAN.md               # Epics, user stories, and task tracking
└── README.md                     # Engineering documentation
```

---

## Quickstart & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher (v24 LTS tested)
- **npm**: v9.0.0 or higher
- **MongoDB**: (Optional) MongoDB v6+ running locally on port 27017 or MongoDB Atlas connection string. If MongoDB is not installed, the application automatically launches an embedded in-memory MongoDB database.

### 1. Backend Setup
```bash
cd backend
npm install

# (Optional) Seed the database manually
npm run seed

# Run the test suite
npm test

# Start backend in development mode
npm run dev
# OR for production
npm start
```
*Backend runs on `http://localhost:5000`.*

### 2. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install

# Verify production build
npm run build

# Start frontend development server
npm run dev
```
*Frontend runs on `http://localhost:5173` (with `/api` proxied to port 5000).*

---

## Seed Credentials

When the database is seeded, the following accounts are provisioned:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@imovies.com` | `admin123` | Full administrative access, movie CRUD, screening scheduler, analytics dashboard |
| **Customer** | `user@imovies.com` | `user123` | Movie browsing, seat selection, booking, tickets ledger, cancellations |

---

## Environment Variables

### Backend (`backend/.env`)
```ini
PORT=5000
MONGODB_URI=mongodb://localhost:27017/imovies
JWT_SECRET=imovies_jwt_secret_key_2024
JWT_EXPIRE=7d
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```ini
VITE_API_URL=/api
```

---

## API Reference

### Authentication
- `POST /api/auth/register` — Register a customer account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Retrieve authenticated user profile `[Bearer Token]`

### Movies
- `GET /api/movies` — List movies (optional filters: `status`, `genre`, `search`)
- `GET /api/movies/:id` — Retrieve movie details
- `POST /api/movies` — Create new movie `[Admin]`
- `PUT /api/movies/:id` — Update existing movie `[Admin]`
- `DELETE /api/movies/:id` — Delete movie `[Admin]`

### Cinemas & Screens
- `GET /api/cinemas` — List all cinemas and screen layouts
- `GET /api/cinemas/:id` — Retrieve cinema details
- `POST /api/cinemas` — Create cinema with screen layouts `[Admin]`
- `PUT /api/cinemas/:id` — Update cinema details `[Admin]`
- `DELETE /api/cinemas/:id` — Delete cinema `[Admin]`

### Showtimes
- `GET /api/showtimes` — List showtimes (optional filters: `movie`, `cinema`, `date`)
- `GET /api/showtimes/:id` — Retrieve showtime with populated movie and screen info
- `POST /api/showtimes` — Schedule a screening `[Admin]`
- `PUT /api/showtimes/:id` — Update screening `[Admin]`
- `DELETE /api/showtimes/:id` — Delete screening `[Admin]`

### Bookings
- `GET /api/bookings` — Retrieve current user's booking history `[Bearer Token]`
- `GET /api/bookings/admin/all` — Retrieve all bookings across the system `[Admin]`
- `GET /api/bookings/:id` — Retrieve single booking details `[Owner / Admin]`
- `POST /api/bookings` — Create atomic seat booking `[Bearer Token]`
- `PATCH /api/bookings/:id/cancel` — Cancel reservation & release seats `[Owner / Admin]`

### Analytics Dashboard
- `GET /api/dashboard/stats` — Revenue, counts, popular movies, and recent orders `[Admin]`

---

## Test Verification

Execute backend test suite:
```bash
cd backend
npm test
```

Results:
```
PASS tests/booking.test.js
PASS tests/movies.test.js
PASS tests/auth.test.js

Test Suites: 3 passed, 3 total
Tests:       23 passed, 23 total
Snapshots:   0 total
Time:        13.393 s
```


---

## Vercel Deployment Guide

The repository is pre-configured for full-stack deployment on Vercel as a unified application:
- **Frontend**: Vite Single Page App built to `frontend/dist` with SPA routing rewrites.
- **Backend API**: Express application wrapped as a Vercel Serverless Function via `/api/index.js`.

### 1. Deploying via Vercel Dashboard (Recommended)
1. Push your repository to GitHub: `https://github.com/YaMa04062005/I-Movies`.
2. Go to [vercel.com](https://vercel.com) and click **"Add New..." > "Project"**.
3. Import the `I-Movies` repository.
4. Keep the **Root Directory** as `./` (the root).
5. Add the following **Environment Variables** in the Vercel project settings:
   - `MONGODB_URI`: Your MongoDB Atlas connection URI (e.g. `mongodb+srv://user:pass@cluster0.mongodb.net/imovies?retryWrites=true&w=majority`).
   - `JWT_SECRET`: A secure random secret string (e.g. minimum 32 characters).
   - `JWT_EXPIRE`: `7d`
   - `NODE_ENV`: `production`
6. Click **Deploy**. Vercel will run `npm run build` and provision the frontend static assets and serverless API automatically.

### 2. Deploying via Vercel CLI
```bash
npm install -g vercel
vercel login
vercel
# When prompted to deploy to production:
vercel --prod
```

---

## Git Push Guide

The local repository is on branch `main` and points to remote `origin`:
```bash
git remote -v
# origin  https://github.com/YaMa04062005/I-Movies.git (fetch)
# origin  https://github.com/YaMa04062005/I-Movies.git (push)
```

To push to GitHub:
```bash
# Using standard git push (will prompt for GitHub authentication if needed):
git push -u origin main

# If using a GitHub Personal Access Token (PAT):
git push https://<YOUR_GITHUB_TOKEN>@github.com/YaMa04062005/I-Movies.git main
```
