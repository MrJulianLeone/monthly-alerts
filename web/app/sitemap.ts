import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.monthlyalerts.com";
  return [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/for-contractors`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/renovating-abroad`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/for-designers`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/for-homeowners`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/login`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
