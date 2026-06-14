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

## Supabase Tables

The backend reuses an existing `public.users` table with this shape:

```sql
-- Existing table expected by the backend.
-- id maps to app user_id, role_level maps to ADMIN/USER,
-- and is_active/status map to ACTIVE/PENDING.
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  full_name text not null,
  role_level text not null,
  password_hash text,
  is_active boolean not null default false,
  status text not null default 'PENDING'
);
```

Create these app tables:

```sql
create table if not exists public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  submission_code text not null unique,
  form_type text not null check (form_type in ('HADAHAN', 'PORONDAM')),
  submitted_by_type text not null check (submitted_by_type in ('USER', 'GUEST')),
  submitted_by_user_id uuid null references public.users(id),
  submitted_by_name text not null default 'Guest',
  status text not null default 'NEW' check (status in ('NEW', 'ON_HOLD', 'DONE', 'CANCELLED')),
  admin_note text,
  preferred_language text not null default 'SINHALA' check (preferred_language in ('ENGLISH', 'SINHALA')),
  contact_person_name text,
  address text,
  contact_number text not null,
  additional_contact_number text,
  full_name text,
  date_of_birth date,
  time_of_birth time,
  place_of_birth text,
  additional_notes text,
  girl_full_name text,
  girl_date_of_birth date,
  girl_time_of_birth time,
  girl_place_of_birth text,
  boy_full_name text,
  boy_date_of_birth date,
  boy_time_of_birth time,
  boy_place_of_birth text,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists form_submissions_form_type_idx on public.form_submissions(form_type);
create index if not exists form_submissions_status_idx on public.form_submissions(status);
create index if not exists form_submissions_submitted_at_idx on public.form_submissions(submitted_at desc);
create index if not exists form_submissions_user_idx on public.form_submissions(submitted_by_user_id);

create table if not exists public.admin_push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  expo_push_token text not null unique,
  device_name text,
  platform text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists admin_push_tokens_user_id_idx on public.admin_push_tokens(user_id);
create index if not exists admin_push_tokens_active_idx on public.admin_push_tokens(is_active);
```

## Google Sheets

Create workbook `Swasthi_Life_App_Data` with sheets:

- `Hadahan`
- `Porondam`

Put the spreadsheet id and service-account file path in `backend/.env`.

Supabase is the source of truth. Google Sheets receives a copy of each new submission when the Google Sheets env vars are configured.

## Admin Notifications

The mobile app registers Expo push tokens for admin users after login. When a new form submission is saved, the backend sends a push notification to active admin tokens in `admin_push_tokens`.
