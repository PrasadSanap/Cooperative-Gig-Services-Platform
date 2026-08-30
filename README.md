# Cooperative Gig Services Platform

A cooperative-owned digital marketplace connecting verified household/community
service workers (electricians, plumbers, carpenters, caregivers, drivers, etc.)
with customers — with fair wages, worker welfare, and geo-matching.

## Stack
- Frontend: React (Vite/CRA-style), react-router-dom, i18next (multilingual)
- Backend: Node.js, Express, MongoDB (Mongoose), Razorpay/Stripe stub for payments
- Geo-matching: MongoDB 2dsphere geospatial queries

## Quick Start

### Backend
```bash
cd backend
npm install
cp ../.env.example .env   # fill in values
npm start
```
Server runs at http://localhost:5000

### Frontend
```bash
cd frontend
npm install
npm start
```
App runs at http://localhost:3000

## Sample Flow
1. Customer submits a booking via `BookingForm` (frontend) → `POST /api/bookings`
2. Backend geo-matches nearest available worker (MongoDB `$near` query)
3. Booking stored with status `pending` → payment initiated → invoice generated

## Modules Included
- Worker & Customer registration/verification models
- Booking & scheduling API (sample route fully implemented)
- Geo-location based matching (2dsphere index)
- Rating/feedback fields on Booking model
- Payment stub (utils/payment.js) — swap in real gateway keys
- Multilingual frontend (English + Hindi via i18next)
- Admin dashboard page stub for cooperative federation

## Next Steps (not scaffolded, but planned)
- AI demand forecasting microservice (Python/Node worker + cron)
- Insurance/welfare integration APIs
- Push notifications for emergency/on-demand bookings