# Swasthi Life Form Application

This repository contains the v1 scaffold for the Swasthi Life form system.

## Apps

- `backend/` - FastAPI API server. Owns auth, role checks, validation, request numbers, Supabase user access, and Google Sheets form writes.
- `mobile/` - Expo React Native app for `USER` and `ADMIN`.
- `guest-web/` - React/Vite public web app for guest submissions.

## v1 Storage Rule

- User and admin account data comes from Supabase when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured.
- Hadahan and Porondam form details are saved through the backend to Google Sheets when Google Sheets env vars are configured.
- Without external credentials, the backend uses `.local-data/*.json` so development can start immediately.

## Run Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

Local development starts with a pending admin account:

```text
username: admin
```

Enter `admin` on the mobile login screen, then create a password to activate it.

## Run Mobile App

```bash
cd mobile
npm install
$env:EXPO_PUBLIC_API_URL="http://localhost:8000"
npm run start
```

## Run Guest Web

```bash
cd guest-web
npm install
$env:VITE_API_URL="http://localhost:8000"
npm run dev
```

## Supabase User Table

Use a table compatible with:

```sql
create table app_users (
  user_id uuid primary key,
  full_name text not null,
  username text not null unique,
  password_hash text,
  role text not null check (role in ('ADMIN', 'USER')),
  account_status text not null check (account_status in ('PENDING', 'ACTIVE')),
  created_at timestamptz default now(),
  last_login timestamptz
);
```

## Google Sheets

Create workbook `Swasthi_Life_App_Data` with sheets:

- `Hadahan`
- `Porondam`
- `ActivityLog`
- `Settings`

Put the spreadsheet id and service-account file path in `backend/.env`.
