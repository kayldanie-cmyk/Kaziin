import type { NextConfig } from "next";

const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "ADMIN_SECRET",
];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(
      `\n❌ Missing required environment variable: ${key}\n` +
        `   Copy .env.example → .env.local and fill in your values.\n` +
        `   In Vercel, add it under Project Settings → Environment Variables.\n`
    );
  }
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
};

export default nextConfig;
