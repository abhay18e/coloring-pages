// File: app/[category]/page/[pageNumber]/page.tsx
// app/[category]/page/[pageNumber]/page.tsx
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { listAllR2Images } from "@/lib/r2";
import { R2ImageInfo } from "@/types";
import { notFound } from "next/navigation";
import { Metadata } from "next";

const IMAGES_PER_PAGE = 15; // Must match the value in app/[category]/page.tsx
const SITE_BASE_URL = "https://freecoloringpages.fun";

const PLACEHOLDER_PARAM = { category: "_placeholder", pageNumber: "2" };

export async function generateStaticParams() {
  console.log(
    "Attempting to generate static params for paginated category pages (page 2+)..."
  );
  let calculatedParams: Array<{ category: string; pageNumber: string }> = [];

  try {
    const allImages = await listAllR2Images();
    if (!allImages || allImages.length === 0) {
      console.warn(
        "generateStaticParams (paginated): No images returned from listAllR2Images. Will use placeholder if no params are generated."
      );
    } else {
      console.log(
        `generateStaticParams (paginated): Fetched ${allImages.length} total images.`
      );
      const imagesByCategory: { [category: string]: R2ImageInfo[] } = {};
      allImages.forEach((img) => {
        if (img && img.category) {
          if (!imagesByCategory[img.category]) {
            imagesByCategory[img.category] = [];
          }
          imagesByCategory[img.category].push(img);
        }
      });

      for (const category in imagesByCategory) {
        if (category === PLACEHOLDER_PARAM.category) continue;
        const totalImages = imagesByCategory[category].length;
        const totalPages = Math.ceil(totalImages / IMAGES_PER_PAGE);
        for (let i = 2; i <= totalPages; i++) {
          calculatedParams.push({
            category: category,
            pageNumber: i.toString(),
          });
        }
      }
      console.log(
        `generateStaticParams (paginated): Calculated ${calculatedParams.length} static params for pages 2+.`
      );
    }
  } catch (error) {
    console.error(
      "!!! CRITICAL ERROR during generateStaticParams (paginated) calculation:",
      error
    );
    calculatedParams = []; // Fallback to placeholder on error
  }

  if (calculatedParams.length === 0) {
    console.warn(
      "generateStaticParams (paginated): No valid params generated. Returning placeholder param:",
      [PLACEHOLDER_PARAM]
    );
    return [PLACEHOLDER_PARAM];
  } else {
    console.log(
      `generateStaticParams (paginated): Returning ${calculatedParams.length} calculated params.`
    );
    return calculatedParams;
  }
}

// Generate metadata for paginated category pages
export async function generateMetadata({
  params,
}: {
  params: { category: string; pageNumber: string };
}): Promise<Metadata> {
  const { category, pageNumber } = params;
  const currentPage = parseInt(pageNumber, 10);

  if (
    isNaN(currentPage) ||
    currentPage < 1 ||
    category === PLACEHOLDER_PARAM.category
  ) {
    // Also check placeholder
    return { title: "Invalid Page", alternates: { canonical: SITE_BASE_URL } }; // Fallback
  }

  const displayCategoryName = category.replace(/-/g, " ");
  const capitalizedCategoryName =
    displayCategoryName.charAt(0).toUpperCase() + displayCategoryName.slice(1);

  const allImages = await listAllR2Images();
  const categoryImages = allImages.filter((img) => img.category === category);
  const totalImages = categoryImages.length;
  const totalPages = Math.ceil(totalImages / IMAGES_PER_PAGE);

  if (currentPage > totalPages && totalImages > 0) {
    // Only if category actually has images
    // This case should ideally be caught by notFound in the page component,
    // but as a fallback for metadata:
    return {
      title: `Page Not Found - ${capitalizedCategoryName}`,
      description: `This page does not exist for ${displayCategoryName.toLowerCase()} .`,
      alternates: { canonical: `${SITE_BASE_URL}/${category}` }, // Canonical to first page
    };
  }

  const pageTitle = `${capitalizedCategoryName}  - Page ${currentPage} of ${totalPages}`;
  const pageDescription = `Explore free printable ${displayCategoryName.toLowerCase()} . High-quality coloring sheets for kids and adults. Page ${currentPage} of ${totalPages}.`;
  const canonicalUrl = `${SITE_BASE_URL}/${category}/page/${currentPage}`;

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
    },
  };
}

export default async function CategoryPaginatedPage({
  params,
}: {
  params: { category: string; pageNumber: string };
}) {
  const { category, pageNumber } = params;

  // Handle placeholder route if accessed directly during dev or due to build issues
  if (
    category === PLACEHOLDER_PARAM.category &&
    pageNumber === PLACEHOLDER_PARAM.pageNumber
  ) {
    console.warn(
      `Placeholder route /_placeholder/page/2 accessed. This page should not be navigable. Returning 404.`
    );
    notFound();
  }

  const currentPage = parseInt(pageNumber, 10);

  if (isNaN(currentPage) || currentPage < 2) {
    // Page 1 is handled by app/[category]/page.tsx
    console.error(
      `Invalid page number for paginated route: ${pageNumber}. Should be >= 2.`
    );
    notFound();
  }

  const allImages = await listAllR2Images();
  const categoryImages = allImages.filter((img) => img.category === category);

  if (categoryImages.length === 0) {
    console.warn(
      `No images found for category ${category} on paginated route. Returning 404.`
    );
    notFound(); // No images for this category, so no paginated pages exist
  }

  categoryImages.sort((a, b) => a.name.localeCompare(b.name));

  const totalImages = categoryImages.length;
  const totalPages = Math.ceil(totalImages / IMAGES_PER_PAGE);

  if (currentPage > totalPages) {
    console.warn(
      `Page ${currentPage} out of bounds for category ${category}. Max pages: ${totalPages}. Returning 404.`
    );
    notFound();
  }

  const startIndex = (currentPage - 1) * IMAGES_PER_PAGE;
  const endIndex = startIndex + IMAGES_PER_PAGE;
  const imagesForPage = categoryImages.slice(startIndex, endIndex);

  const nextPage = currentPage < totalPages ? currentPage + 1 : null;
  const prevPage = currentPage > 1 ? currentPage - 1 : null;

  const displayCategoryName = category.replace(/-/g, " ");
  const capitalizedCategoryName =
    displayCategoryName.charAt(0).toUpperCase() + displayCategoryName.slice(1);
  const canonicalUrl = `${SITE_BASE_URL}/${category}/page/${currentPage}`;

  // Structured Data for CollectionPage and ItemList
  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${capitalizedCategoryName} Coloring Pages - Page ${currentPage}`,
    description: `Explore free printable ${displayCategoryName.toLowerCase()} coloring pages. Page ${currentPage} of ${totalPages}.`,
    url: canonicalUrl,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: imagesForPage.map((image, index) => {
        const titlePart = image.name.replace(/\s+/g, "-").toLowerCase();
        const filenamePart = image.key.split("/").pop() || "";
        const imageSlug = `${titlePart}-${filenamePart}`;
        return {
          "@type": "ListItem",
          position: startIndex + index + 1,
          item: {
            "@type": "ImageObject",
            name: image.name,
            contentUrl: image.src,
            thumbnailUrl: image.src,
            description: image.alt || `Coloring page of ${image.name}`,
            url: `${SITE_BASE_URL}/${category}/${imageSlug}`,
            isPartOf: { "@id": canonicalUrl },
          },
        };
      }),
    },
  };

  return (
    <div className="max-w-7xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionPageSchema),
        }}
      />
      {/* Breadcrumb with cleaner styling */}
      <nav className="text-sm mb-8 flex items-center text-gray-500">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Home
        </Link>
        <svg
          className="w-3 h-3 mx-2 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
        <Link
          href={`/${category}`}
          className="hover:text-blue-600 transition-colors capitalize"
        >
          {displayCategoryName}
        </Link>
        <svg
          className="w-3 h-3 mx-2 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span className="text-gray-800">Page {currentPage}</span>
      </nav>

      {/* Header section */}
      <div className="mb-10 border-b border-gray-100 pb-6">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 capitalize">
          {capitalizedCategoryName} Coloring Pages
        </h1>
        <p className="text-gray-600">
          Browse and download free {displayCategoryName.toLowerCase()} coloring
          pages. Page {currentPage} of {totalPages} • {totalImages} printable
          coloring sheets
        </p>
      </div>

      {imagesForPage.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          No images found for this page.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {imagesForPage.map((image) => {
            const titlePart = image.name.replace(/\s+/g, "-").toLowerCase();
            const filenamePart = image.key.split("/").pop() || "";
            const newSlug = `${titlePart}-${filenamePart}`;

            return (
              <Link
                key={image.key}
                href={`/${category}/${newSlug}`}
                className="apple-card overflow-hidden hover:scale-[1.03] group flex flex-col"
              >
                <div className="aspect-square w-full relative bg-gray-50">
                  <Image
                    src={image.src}
                    alt={
                      image.alt || `Coloring page thumbnail of ${image.name}`
                    }
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-contain p-2"
                    unoptimized={true}
                  />
                </div>
                <div className="p-4 border-t border-gray-50">
                  <h3 className="font-medium text-gray-800 text-sm truncate group-hover:text-blue-600">
                    {image.name}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination Controls with Apple-inspired styling */}
      <div className="flex justify-between items-center mt-8 mb-4">
        {prevPage ? (
          prevPage === 1 ? ( // Link to base category page if previous is page 1
            <Link
              href={`/${category}`}
              className="apple-secondary-button flex items-center"
            >
              <ArrowLeft size={16} className="mr-1" /> Previous
            </Link>
          ) : (
            <Link
              href={`/${category}/page/${prevPage}`}
              className="apple-secondary-button flex items-center"
            >
              <ArrowLeft size={16} className="mr-1" /> Previous
            </Link>
          )
        ) : (
          // This case (no prevPage) should ideally not happen on a page >= 2,
          // but as a fallback display disabled button.
          <span className="apple-secondary-button opacity-50 cursor-not-allowed flex items-center">
            <ArrowLeft size={16} className="mr-1" /> Previous
          </span>
        )}

        {nextPage ? (
          <Link
            href={`/${category}/page/${nextPage}`}
            className="apple-button flex items-center"
          >
            Next <ArrowRight size={16} className="ml-1" />
          </Link>
        ) : (
          <span className="apple-secondary-button opacity-50 cursor-not-allowed flex items-center">
            Next <ArrowRight size={16} className="ml-1" />
          </span>
        )}
      </div>

      {/* Page indicator */}
      <div className="text-center text-sm text-gray-500 mt-4">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
}
