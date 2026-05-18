# Glamour Studio — Salon Booking App

A full salon booking web app with customer and admin panels.

## Features
- Customer login (name + phone)
- Service selection with price & duration
- Date picker + time slot booking
- UPI payment flow
- My bookings + cancel
- Admin login (email + password)
- Admin stats dashboard
- Confirm / reject bookings
- Mark payment received
- Leave / holiday toggle with custom message
- PWA — installs on phone home screen like an app

## Setup (3 steps)

### Step 1 — Customize the app
Open `src/App.jsx` and edit the top config section:
```
const ADMIN_EMAIL    = "your@email.com";
const ADMIN_PASSWORD = "yourpassword";
const YOUR_UPI_ID    = "yourname@upi";  // or FamPay UPI
const SALON_NAME     = "Your Salon Name";
```

### Step 2 — Push to GitHub
1. Create a new repo on github.com
2. Upload all these files
3. Done

### Step 3 — Deploy to Vercel
1. Go to vercel.com → sign up with GitHub
2. New Project → select your repo → Deploy
3. Your app is live at yourapp.vercel.app

## Add Supabase database (optional, for real data)
1. Go to supabase.com → new project
2. Get Project URL and Anon Key from Settings → API
3. Create .env file from .env.example
4. Add the same keys to Vercel → Settings → Environment Variables
5. Redeploy

## Add your UPI QR code
In App.jsx, find the comment "Add your UPI QR code here" and replace the placeholder div with:
```jsx
<img src="/your-qr-code.png" style={{ width:130, height:130 }} alt="UPI QR" />
```
Put your QR image in the `public/` folder.
