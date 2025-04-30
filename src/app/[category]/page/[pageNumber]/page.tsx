// app/[category]/page/[pageNumber]/page.tsx
import Link from "next/link";
import Image from "next/image";
import { listAllR2Images } from "@/lib/r2"; // Import R2 function
import { R2ImageInfo } from "@/types";

const IMAGES_PER_PAGE = 12; // Must match the value in app/[category]/page.tsx

// Generate static parameters for each category and page number > 1
export async function generateStaticParams() {
  // Fetch all images at build time
  const allImages = await listAllR2Images();
  const params = [];

  // Group images by category
  const imagesByCategory: { [category: string]: R2ImageInfo[] } = {};
  allImages.forEach((img) => {
    if (!imagesByCategory[img.category]) {
      imagesByCategory[img.category] = [];
    }
    imagesByCategory[img.category].push(img);
  });

  // For each category, calculate total pages and generate params for pages > 1
  for (const category in imagesByCategory) {
    const totalImages = imagesByCategory[category].length;
    const totalPages = Math.ceil(totalImages / IMAGES_PER_PAGE);

    // Generate params for pages 2 onwards
    for (let i = 2; i <= totalPages; i++) {
      params.push({
        category: category,
        pageNumber: i.toString(), // pageNumber must be a string for the URL segment
      });
    }
  }

  console.log(
    `Generating static params for ${params.length} paginated category pages (page 2+).`
  );
  return params;
}

export default async function CategoryPaginatedPage({
  params,
}: {
  params: { category: string; pageNumber: string };
}) {
  const { category, pageNumber } = params;
  // Parse the page number from the URL segment string to an integer
  const currentPage = parseInt(pageNumber, 10);

  // Basic validation (though generateStaticParams should prevent invalid numbers for static export)
  if (isNaN(currentPage) || currentPage < 2) {
    // This block is primarily for defensive coding or if dynamic rendering was enabled
    console.error(`Invalid page number accessed: ${pageNumber}`);
    return (
      <div className="text-center py-10 text-red-600">Invalid page number.</div>
    );
  }

  // Fetch all images at build time (this happens once per build)
  const allImages = await listAllR2Images();
  // Filter images belonging to the current category
  const categoryImages = allImages.filter((img) => img.category === category);

  // Sort images (e.g., by name) - important for consistent pagination
  categoryImages.sort((a, b) => a.name.localeCompare(b.name));

  const totalImages = categoryImages.length;
  const totalPages = Math.ceil(totalImages / IMAGES_PER_PAGE);

  // Ensure the requested page is within bounds (again, mostly defensive for static export)
  if (currentPage > totalPages) {
    console.warn(
      `Page ${currentPage} out of bounds for category ${category}. Max pages: ${totalPages}`
    );
    return (
      <div className="text-center py-10 text-red-600">
        Page not found. This category only has {totalPages} pages.
      </div>
    );
  }

  // Calculate the start and end index for the current page's images
  const startIndex = (currentPage - 1) * IMAGES_PER_PAGE;
  const endIndex = startIndex + IMAGES_PER_PAGE;
  // Slice the array to get images for the current page
  const imagesForPage = categoryImages.slice(startIndex, endIndex);

  // Determine next and previous page links
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;
  const prevPage = currentPage > 1 ? currentPage - 1 : null;

  // Format category name for display on the page
  const displayCategoryName = category.replace(/-/g, " ");

  return (
    <div>
      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-6 text-gray-800 capitalize">
        {displayCategoryName}
      </h1>
      {/* Pagination Info */}
      <p className="text-gray-600 mb-8">
        Showing page {currentPage} of {totalPages} ({totalImages} images total)
      </p>

      {/* Image Grid */}
      {imagesForPage.length === 0 ? (
        // This case should theoretically not happen if totalPages logic is correct and currentPage is valid
        <p className="text-gray-500">No images found for this page.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {imagesForPage.map((image) => (
            <div
              key={image.key} // Use the unique R2 key as the React key
              className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 flex flex-col"
            >
              <div className="aspect-square w-full relative bg-gray-100">
                {/* Use next/image with R2 public URL */}
                <Image
                  src={image.src}
                  alt={image.alt} // Use alt text from R2 metadata
                  fill // Make the image fill the parent div
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-contain p-2" // Add padding inside the image container
                  unoptimized={true} // <-- Add this prop
                />
              </div>
              <div className="p-3 border-t">
                <h3 className="font-semibold text-gray-700 text-sm mb-1 truncate">
                  {image.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-between mt-8">
        {/* Previous page control */}
        {prevPage ? (
          // Link to previous page (either /category for page 1, or /category/page/[pageNumber] for pages > 1)
          prevPage === 1 ? (
            <Link
              href={`/${category}`} // Link to the root category page if going back to page 1
              className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
            >
              Previous Page
            </Link>
          ) : (
            <Link
              href={`/${category}/page/${prevPage}`} // Link to the paginated route for other pages
              className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
            >
              Previous Page
            </Link>
          )
        ) : (
          // Disable button if no previous page
          <span className="px-4 py-2 text-sm font-medium rounded-md text-gray-400 bg-gray-200 cursor-not-allowed">
            Previous Page
          </span>
        )}

        {/* Next page control */}
        {nextPage ? (
          // Link to next page/[pageNumber] route
          <Link
            href={`/${category}/page/${nextPage}`}
            className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Next Page
          </Link>
        ) : (
          // Disable button if no next page
          <span className="px-4 py-2 text-sm font-medium rounded-md text-gray-400 bg-gray-200 cursor-not-allowed">
            Next Page
          </span>
        )}
      </div>
    </div>
  );
}
