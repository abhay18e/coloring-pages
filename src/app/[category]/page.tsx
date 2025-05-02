// File: [category]/page.tsx
// app/[category]/page.tsx
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { listAllR2Images } from "@/lib/r2"; // Import R2 function
// R2ImageInfo type is imported implicitly via listAllR2Images return type

const IMAGES_PER_PAGE = 10; // Increased number of images per page

// Generate static parameters for each category
export async function generateStaticParams() {
  const allImages = await listAllR2Images();
  const categories = new Set<string>();
  allImages.forEach((img) => categories.add(img.category));

  console.log(
    `Generating static params for ${categories.size} category first pages.`
  );

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

  const allImages = await listAllR2Images();
  const categoryImages = allImages.filter((img) => img.category === category);

  categoryImages.sort((a, b) => a.name.localeCompare(b.name));

  const totalImages = categoryImages.length;
  const totalPages = Math.ceil(totalImages / IMAGES_PER_PAGE);
  const currentPage = 1; // This specific route is always page 1

  const startIndex = (currentPage - 1) * IMAGES_PER_PAGE;
  const endIndex = startIndex + IMAGES_PER_PAGE;
  const imagesForPage = categoryImages.slice(startIndex, endIndex);

  const nextPage = currentPage < totalPages ? currentPage + 1 : null;
  const prevPage = null; // Always null on the first page route

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
        <span className="text-gray-800 capitalize font-medium">
          {displayCategoryName}
        </span>
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
          No images found in this category.
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
        <span className="apple-secondary-button opacity-50 cursor-not-allowed flex items-center">
          <ArrowLeft size={16} className="mr-1" /> Previous
        </span>

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
