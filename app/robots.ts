import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();
  return {
    rules: [{ userAgent: "*", allow: ["/"], disallow: ["/admin", "/dashboard", "/global-dashboard", "/hire"] }],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
