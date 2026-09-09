import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin", "/dashboard", "/projects/", "/settings", "/w/", "/r/"],
      },
    ],
    sitemap: "https://www.monthlyalerts.com/sitemap.xml",
  };
}
