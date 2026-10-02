# Kaziin

> Find work. Go global. Hire talent.

A smarter way to connect people with opportunity — locally, remotely and across borders.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Auth & DB**: Supabase (PostgreSQL + Auth)
- **Payments**: M-Pesa via Safaricom Daraja API
- **Styling**: Tailwind CSS v4
- **Deployment**: Vercel

---

## Local Development

### 1. Clone the repo

```bash
git clone https://github.com/your-username/kaziin.git
cd kaziin
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in every value. See the comments in `.env.example` for where to find each value.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploying to Vercel

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/kaziin.git
git push -u origin main
```

### Step 2 — Import into Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import your GitHub repo.
2. Vercel auto-detects Next.js — leave build settings as default.

### Step 3 — Add Environment Variables in Vercel

In **Project Settings → Environment Variables**, add every variable from `.env.example`:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase Dashboard → Project Settings → API |
| `DATABASE_URL` | Supabase Dashboard → Project Settings → Database → Transaction Pooler (port 6543) |
| `DIRECT_URL` | Supabase Dashboard → Project Settings → Database → Direct connection (port 5432) |
| `GOOGLE_CLIENT_ID` | [console.cloud.google.com](https://console.cloud.google.com) |
| `GOOGLE_CLIENT_SECRET` | [console.cloud.google.com](https://console.cloud.google.com) |
| `MPESA_CONSUMER_KEY` | [developer.safaricom.co.ke](https://developer.safaricom.co.ke) |
| `MPESA_CONSUMER_SECRET` | Safaricom Developer Portal |
| `MPESA_SHORTCODE` | Safaricom Developer Portal |
| `MPESA_PASSKEY` | Safaricom Developer Portal (Lipa Na M-Pesa passkey) |
| `MPESA_ENV` | `sandbox` or `production` |
| `MPESA_CALLBACK_BASE_URL` | Your Vercel domain, e.g. `https://kaziin.vercel.app` |
| `ADMIN_SECRET` | Generate with: `openssl rand -base64 32` |

> ⚠️ **Never paste real secrets into code or commit `.env` / `.env.local`.** Those files are git-ignored for your protection.

### Step 4 — Update Supabase Auth callback URLs

In **Supabase Dashboard → Auth → URL Configuration**, add your Vercel domain:

```
Site URL:       https://kaziin.vercel.app
Redirect URLs:  https://kaziin.vercel.app/**
                http://localhost:3000/**
```

### Step 5 — Update Google OAuth redirect URI

In **Google Cloud Console → Credentials → OAuth 2.0 Client**, add:

```
https://your-project-id.supabase.co/auth/v1/callback
```

### Step 6 — Deploy

Click **Deploy** in Vercel. The build will fail with a clear error message if any required environment variable is missing.

---

## Project Structure

```
kaziin/
├── app/              # Next.js App Router pages & API routes
│   ├── api/          # Server-side API endpoints
│   ├── auth/         # Sign-in / sign-up pages
│   ├── dashboard/    # Candidate dashboard
│   ├── hire/         # Recruiter portal
│   └── admin/        # Admin panel
├── components/       # Reusable UI components
├── lib/              # Business logic & integrations
│   ├── supabase/     # Supabase browser & server clients
│   ├── daraja.ts     # M-Pesa / Daraja integration
│   └── ai.ts         # AI service stubs
├── middleware.ts      # Auth & role-based routing
├── .env.example      # ← template: copy to .env.local
└── vercel.json       # Vercel deployment & security headers
```

---

## Security

- All secrets are loaded exclusively from environment variables — **nothing is hardcoded**.
- `.env` and `.env.local` are git-ignored and must never be committed.
- Build fails fast at startup if a required env var is missing.
- `vercel.json` enforces HTTP security headers on every response:
  - `X-Frame-Options: DENY` (clickjacking protection)
  - `X-Content-Type-Options: nosniff`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - API routes return `Cache-Control: no-store`
- `X-Powered-By` header is disabled (tech-stack fingerprinting prevention).

---

## License

Private — all rights reserved.
