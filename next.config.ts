import type { NextConfig } from "next";

// ── Build-time environment variable validation ────────────────────────────────
// Fail the build immediately if any required server-side secret is missing.
// (NEXT_PUBLIC_* vars are validated in the browser at runtime by the Supabase clients.)
const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "ADMIN_SECRET",
];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    console.warn(
      `\n⚠️  Missing environment variable: ${key}\n` +
        `   Copy .env.example → .env.local and fill in your values.\n` +
        `   In Vercel, add it under Project Settings → Environment Variables.\n`
    );
  }
}

const nextConfig: NextConfig = {
  // Disable the "X-Powered-By: Next.js" header so the tech stack isn't advertised
  poweredByHeader: false,
};

export default nextConfig;