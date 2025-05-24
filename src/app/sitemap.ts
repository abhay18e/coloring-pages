import { MetadataRoute } from "next";
import { getR2Categories } from "@/lib/r2";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://freecoloringpages.fun";

  // Get all categories
  const categories = await getR2Categories();

  // Create sitemap entries
  const sitemapEntries: MetadataRoute.Sitemap = [
    // Homepage
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    // Category pages
    ...categories.map((category) => ({
      url: `${baseUrl}/${category}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];

  return sitemapEntries;
}
