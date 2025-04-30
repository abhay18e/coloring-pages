// app/[category]/page.tsx
import Link from "next/link";
import Image from "next/image";
import { listAllR2Images } from "@/lib/r2"; // Import R2 function
import { R2ImageInfo } from "@/types";

const IMAGES_PER_PAGE = 12; // Number of images per page

// Generate static parameters for each category
export async function generateStaticParams() {
  // Fetch all images at build time to determine available categories
  const allImages = await listAllR2Images();
  const categories = new Set<string>();
  allImages.forEach((img) => categories.add(img.category));

  console.log(`Generating static params for ${categories.size} categories.`);

  // Return an array of objects, each with a 'category' parameter
  return Array.from(categories).map((category) => ({
    category: category,
  }));
}

export default async function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const { category } = params;

  // Fetch all images at build time (this happens once per build)
  const allImages = await listAllR2Images();
  // Filter images belonging to the current category
  const categoryImages = allImages.filter((img) => img.category === category);

  // Sort images (e.g., by name) - important for consistent pagination
  categoryImages.sort((a, b) => a.name.localeCompare(b.name));

  const totalImages = categoryImages.length;
  const totalPages = Math.ceil(totalImages / IMAGES_PER_PAGE);
  const currentPage = 1; // This specific route is always page 1

  const startIndex = (currentPage - 1) * IMAGES_PER_PAGE;
  const endIndex = startIndex + IMAGES_PER_PAGE;
  // Slice the array to get images for the current page
  const imagesForPage = categoryImages.slice(startIndex, endIndex);


  // Determine next page link (previous page link is not needed on page 1)
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;
  const prevPage = null; // Always null on the first page route

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
        <p className="text-gray-500">No images found in this category.</p>
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
                {/* Smaller padding */}
                <h3 className="font-semibold text-gray-700 text-sm mb-1 truncate">
                  {/* Smaller text */}
                  {image.name}
                </h3>
                {/* Optional: Add a link/button here if functionality is added later */}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-between mt-8">
        {/* Previous page control (disabled on page 1) */}
        <span className="px-4 py-2 text-sm font-medium rounded-md text-gray-400 bg-gray-200 cursor-not-allowed">
          Previous Page
        </span>

        {/* Next page control */}
        {nextPage ? (
          // Link to the next page route (e.g., /category/page/2)
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
