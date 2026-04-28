# Skyway Parking Reservation Website

A realistic airport parking reservation and confirmation experience for Skyway Parking at Detroit Metro Airport (DTW).

## Pages
- `/` Home page with hero, trust points, and reservation preview.
- `/reserve` Reservation form with all required fields and DTW fixed airport context.
- `/confirmation` Receipt-style confirmation with reservation details and payment breakdown.

## Pricing Logic
- Daily parking rate: **$12/day**
- Booking fee: **$5**
- Total: `(days * 12) + 5`
- Remaining due at lot: **$0.00**

## Run locally
```bash
npm install
npm run dev
```
Then open `http://localhost:5173`.

## Build check
```bash
npm run build
```
