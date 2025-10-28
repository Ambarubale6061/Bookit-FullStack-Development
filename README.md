# Bookit-FullStack-Development

## Overview

This is a ready-to-run fullstack project:

- Backend: Node.js + Express + MongoDB (Mongoose)
- Frontend: Next.js + TailwindCSS (React)

## Quick start (using MongoDB Atlas)

1. Extract `BookIt-Fullstack.zip`.
2. Create a free MongoDB Atlas cluster and get the connection string.
   Replace `<password>` and `<dbname>` in the connection string.
3. Backend:
   ```
   cd BookIt-Fullstack/backend
   cp .env.example .env
   # edit .env and set MONGODB_URI
   npm install
   npm run seed
   npm start
   ```
   Backend runs at http://localhost:4000 by default.
4. Frontend:
   ```
   cd ../frontend
   cp .env.local.example .env.local
   # edit .env.local if your backend URL differs
   npm install
   npm run dev
   ```
   Frontend runs at http://localhost:3000.

## Endpoints

- GET /api/experiences
- GET /api/experiences/:id
- POST /api/promo/validate { code }
- POST /api/bookings { slotId, name, email, quantity, promoCode }

## Notes

- Money stored in cents.
- Booking uses MongoDB transaction to prevent overbooking (atomic increment).
- Seed script creates sample experiences and slots.

## Demo link

-https://bookit-full-stack-development-e5gn.vercel.app/
