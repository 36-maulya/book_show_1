# BookShow - Movie Ticket Booking Application

A full-stack movie ticket booking application with React, Express, MongoDB, and Clerk authentication.

## Features

- 🎬 Browse now-playing movies from TMDB API
- 🎫 Seat selection with real-time availability
- 💳 Demo payment integration
- 👤 User authentication (Clerk)
- 🎬 Admin dashboard for managing shows
- 📱 Responsive design

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Express.js + MongoDB (Mongoose)
- **Auth**: Clerk
- **Payments**: Demo mode (simulated)

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier)
- Clerk account (free)
- TMDB API key (free)

### Installation

1. Clone the repository

2. Set up the server environment:
```bash
cd server
cp .env.example .env
```

3. Add your environment variables to `server/.env`:
```env
MONGODB_URI=your_mongodb_connection_string
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
TMDB_API_KEY=your_tmdb_api_key
```

4. Set up the client environment:
```bash
cd client
cp .env.example .env
```

5. Add your environment variables to `client/.env`:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_BASE_URL=http://localhost:3000
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/
VITE_CURRENCY=$
```

### Running Locally

1. Start the backend:
```bash
cd server
npm run server
```

2. Start the frontend:
```bash
cd client
npm run dev
```

3. Open http://localhost:5173

## Deployment (Vercel)

### Backend Deployment

1. Fork or push to GitHub
2. Go to Vercel.com and import the repository
3. Select "server" as the root directory
4. Add environment variables in Vercel dashboard
5. Deploy

### Frontend Deployment

1. Go to Vercel.com and import the repository
2. Select "client" as the root directory
3. Add environment variables:
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `VITE_BASE_URL` = your-backend-vercel-url
   - `VITE_TMDB_API_KEY`
   - `VITE_TMDB_IMAGE_BASE_URL`
   - `VITE_CURRENCY`
4. Deploy

## Demo Payment

Use these test card numbers:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000000000009995`
- **OTP Required**: `4000002500003155`

Enter any future date for expiry and any 3-digit CVV.

## Project Structure

```
BookShow/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   └── lib/           # Utility functions
│   └── package.json
├── server/                 # Express backend
│   ├── controllers/       # Route controllers
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── configs/          # Configuration
│   └── server.js          # Entry point
└── SETUP.md              # This file
```

## API Endpoints

### Shows
- `GET /api/show/now-playing` - Get now playing movies from TMDB
- `GET /api/show/all` - Get all upcoming shows
- `GET /api/show/:movieId` - Get show details for a movie
- `POST /api/show/add` - Add a new show (admin)

### Bookings
- `POST /api/booking/create` - Create a booking
- `GET /api/booking/seats/:showId` - Get occupied seats

### User
- `GET /api/user/favorites` - Get user favorites
- `GET /api/user/bookings` - Get user bookings

## License

ISC
