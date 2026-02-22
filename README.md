# 🔐 SecureGate – Visitor Entry Management System

SecureGate is a QR-based Visitor Entry Management System built with Next.js and Supabase.  
It allows visitor registration, QR code generation, SMS notifications, and gate check-in tracking.

---

## 🚀 Features

- Visitor Registration
- QR Code Generation
- SMS Notification (Twilio Integration)
- Admin Dashboard
- Visitor Check-In System
- Blacklist Management
- Check-in Timestamp Tracking
- Secure Backend APIs
- Supabase Database Integration

## 🏗 Tech Stack
Frontend:
- Next.js (App Router)
- TypeScript
- Tailwind CSS

Backend:
- Next.js API Routes
- Supabase (Database & Auth)

SMS Service:
- Twilio


## 📦 Project Structure


app/
├── api/
│ ├── visitors/
│ ├── sms/
│ └── admin/
├── register/
├── verify/
└── admin/


---

## 🗄 Database Schema (Supabase)

```sql
create table visitors (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  email text,
  reason text,
  host text,
  notes text,
  photo_url text,
  qr_code text unique,
  status text default 'registered',
  is_blacklisted boolean default false,
  checked_in_at timestamp,
  created_at timestamp default now()
);
⚙️ Environment Variables

Create a .env.local file in the root directory:

NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number

⚠️ Never expose service role key publicly.

📲 Twilio Setup

Create account at https://twilio.com

Buy a phone number

Verify your receiver number (if using trial account)

Add credentials to .env.local

🛠 Installation

Clone the repository:

git clone <repo-url>
cd securegate

Install dependencies:

npm install

Run development server:

npm run dev

Open:

http://localhost:3000
🔄 Visitor Flow

Admin registers visitor

QR Code generated

SMS sent to visitor

Visitor arrives at gate

QR scanned

Status updated to checked_in

checked_in_at timestamp saved

🔐 Security Notes

Service role key is used only in backend

RLS (Row Level Security) enabled in Supabase

JWT signing keys rotated regularly

SMS failure does not break registration

📊 Admin Features

View total visitors

View checked-in visitors

Blacklist visitors

Track entry time

🎯 Future Improvements

Face recognition integration

Hardware QR scanner integration

Real-time dashboard updates

Email notification system

Role-based access control

👨‍💻 Author

Kishore NK
SecureGate – Visitor Entry System
Built for academic & hackathon purposes.

📄 License

This project is for educational and demonstration purposes.


---
