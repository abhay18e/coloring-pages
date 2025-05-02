// File: [category]/page/[pageNumber]/page.tsx
// app/[category]/page/[pageNumber]/page.tsx
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { listAllR2Images } from "@/lib/r2"; // Import R2 function
import { R2ImageInfo } from "@/types";
import { notFound } from "next/navigation"; // Import notFound

const IMAGES_PER_PAGE = 10; // Must match the value in app/[category]/page.tsx

// Generate static parameters for each category and page number > 1
const PLACEHOLDER_PARAM = { category: "_placeholder", pageNumber: "2" };

export async function generateStaticParams() {
  console.log(
    "Attempting to generate static params for paginated category pages (page 2+)..."
  );
  let calculatedParams: Array<{ category: string; pageNumber: string }> = [];

  try {
    const allImages = await listAllR2Images();

    // Optional: Log the first image to verify data structure during build
    // if (allImages && allImages.length > 0) {
    //   console.log("First image data sample:", allImages[0]);
    // }

    if (!allImages || allImages.length === 0) {
      console.warn(
        "generateStaticParams (paginated): No images returned from listAllR2Images. Will return placeholder."
      );
      // Skip further processing, will hit the check below
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
        } else {
          // Log only if img exists but category doesn't, avoid logging null/undefined if listAllR2Images returns sparse array
          if (img) {
            console.warn(
              `generateStaticParams (paginated): Skipping image with missing category: ${JSON.stringify(
                img
              )}`
            );
          }
        }
      });

      console.log(
        `generateStaticParams (paginated): Grouped images into ${
          Object.keys(imagesByCategory).length
        } categories.`
      );

      for (const category in imagesByCategory) {
        // Ensure category is not the placeholder itself if it somehow gets into R2
        if (category === PLACEHOLDER_PARAM.category) continue;

        const totalImages = imagesByCategory[category].length;
        const totalPages = Math.ceil(totalImages / IMAGES_PER_PAGE);

        // Generate params ONLY for pages 2 and up
        for (let i = 2; i <= totalPages; i++) {
          calculatedParams.push({
            category: category,
            pageNumber: i.toString(),
          });
        }
      }

      console.log(
        `generateStaticParams (paginated): Successfully calculated ${calculatedParams.length} potential static params for pages 2+.`
      );
    }
  } catch (error) {
    console.error(
      "!!! CRITICAL ERROR during generateStaticParams (paginated) calculation:",
      error
    );
    // If an error occurs during calculation, clear any partially calculated params
    // to ensure we fall back to the placeholder.
    calculatedParams = [];
    console.warn(
      "generateStaticParams (paginated): Error occurred, will return placeholder."
    );
  }

  // --- Workaround Check ---
  // If after all calculations (or due to an error/no images), the list is empty,
  // return the placeholder array instead of an empty one.
  if (calculatedParams.length === 0) {
    console.warn(
      "generateStaticParams (paginated): No valid params generated (or error occurred/no images found). Returning placeholder param:",
      [PLACEHOLDER_PARAM]
    );
    return [PLACEHOLDER_PARAM];
  } else {
    // Otherwise, return the successfully calculated parameters.
    console.log(
      `generateStaticParams (paginated): Returning ${calculatedParams.length} calculated params:`,
      calculatedParams // Log the actual params being returned
    );
    return calculatedParams;
  }
}

export default async function CategoryPaginatedPage({
  params,
}: {
  params: { category: string; pageNumber: string };
}) {
  const { category, pageNumber } = params;
  const currentPage = parseInt(pageNumber, 10);

  if (isNaN(currentPage) || currentPage < 2) {
    console.error(
      `Invalid page number accessed directly (should be prevented by generateStaticParams): ${pageNumber}`
    );
    notFound(); // Use notFound for invalid parameters
  }

  const allImages = await listAllR2Images();
  const categoryImages = allImages.filter((img) => img.category === category);

  categoryImages.sort((a, b) => a.name.localeCompare(b.name));

  const totalImages = categoryImages.length;
  const totalPages = Math.ceil(totalImages / IMAGES_PER_PAGE);

  if (currentPage > totalPages) {
    console.warn(
      `Page ${currentPage} out of bounds for category ${category}. Max pages: ${totalPages}. Returning 404.`
    );
    notFound(); // Use notFound if page number is out of range
  }

  const startIndex = (currentPage - 1) * IMAGES_PER_PAGE;
  const endIndex = startIndex + IMAGES_PER_PAGE;
  const imagesForPage = categoryImages.slice(startIndex, endIndex);

  const nextPage = currentPage < totalPages ? currentPage + 1 : null;
  const prevPage = currentPage > 1 ? currentPage - 1 : null;

  const displayCategoryName = category.replace(/-/g, " ");

  return (
    <div className="max-w-7xl mx-auto">
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
          {displayCategoryName} Coloring Pages
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
            // Create the new slug format: title-filename
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
                    alt={image.alt}
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
          prevPage === 1 ? (
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
