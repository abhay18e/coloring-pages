import { MetadataRoute } from "next";
import { listAllR2Images, getR2Categories } from "@/lib/r2";

// These two lines are required for static export with output: export
export const dynamic = "force-static";
export const generateStaticParams = async () => [];

const SITE_BASE_URL = "https://freecoloringpages.fun";
const IMAGES_PER_PAGE = 15; // Ensure this matches your pagination settings

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date().toISOString();

  // Base URLs
  const sitemapEntries: MetadataRoute.Sitemap = [
    {
      url: SITE_BASE_URL,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];

  try {
    console.log("Sitemap generation: Fetching categories and images...");
    const categories = await getR2Categories();
    const allImages = await listAllR2Images(); // Fetch all once
    console.log(
      `Sitemap generation: Fetched ${categories.length} categories and ${allImages.length} images.`
    );

    // Category pages (/[category] and /[category]/page/[pageNumber])
    for (const category of categories) {
      sitemapEntries.push({
        url: `${SITE_BASE_URL}/${category}`,
        lastModified: currentDate,
        changeFrequency: "weekly",
        priority: 0.8,
      });

      const categoryImages = allImages.filter(
        (img) => img.category === category
      );
      const totalPages = Math.ceil(categoryImages.length / IMAGES_PER_PAGE);

      for (let i = 2; i <= totalPages; i++) {
        // Page 1 is covered by /category
        sitemapEntries.push({
          url: `${SITE_BASE_URL}/${category}/page/${i}`,
          lastModified: currentDate,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    }

    // Individual image detail pages (/[category]/[slug])
    for (const image of allImages) {
      // Reconstruct the same slug as used in links and generateStaticParams
      const sanitize = (str: string) => str.replace(/[:*?"<>|\\/]/g, "");

      const titlePart = sanitize(image.name.replace(/\s+/g, "-")).toLowerCase();
      const filenamePart = sanitize(
        image.key.split("/").pop()?.toLowerCase() || ""
      ); // Ensure consistent casing
      const imagePageSlug = `${titlePart}-${filenamePart}`;

      sitemapEntries.push({
        url: `${SITE_BASE_URL}/${image.category}/${imagePageSlug}`,
        lastModified: currentDate, // Ideally, use image upload/modification date if available
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  } catch (error) {
    console.error("Error generating sitemap entries from R2 data:", error);
    // Return base sitemap entries if R2 fetching fails,
    // but the build might still fail if R2 is essential and errors during data fetching for pages.
  }

  console.log(`Generated sitemap with ${sitemapEntries.length} entries.`);
  return sitemapEntries;
}
