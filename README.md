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
git clone https://github.com/kayldanie-cmyk/Kaziin.git
cd Kaziin
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

1. Go to [vercel.com/new](https://vercel.com/new) and import this GitHub repo.
2. Add all environment variables from `.env.example` in Vercel Project Settings → Environment Variables.
3. Click Deploy.

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

## License

Private — all rights reserved.
