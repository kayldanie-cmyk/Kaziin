import type { MetadataRoute } from "next";

const PUBLIC_ROUTES = [
  "", "/jobs", "/global", "/recruiters", "/how-it-works",
  "/pricing", "/trust", "/help", "/privacy", "/security", "/terms",
  "/quick-tasks", "/quick-tasks/post", "/quick-tasks/get", "/quick-tasks/my-tasks",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const now = new Date();
  return PUBLIC_ROUTES.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}

function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
