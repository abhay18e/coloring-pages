// File: app/[category]/page.tsx
// app/[category]/page.tsx
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { listAllR2Images } from "@/lib/r2";
import { Metadata } from "next";
import { notFound } from "next/navigation";

const IMAGES_PER_PAGE = 15; // Increased number of images per page
const SITE_BASE_URL = "https://freecoloringpages.fun";

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

// Generate metadata for category page (Page 1)
export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  const { category } = params;
  const displayCategoryName = category.replace(/-/g, " ");
  const capitalizedCategoryName =
    displayCategoryName.charAt(0).toUpperCase() + displayCategoryName.slice(1);

  const allImages = await listAllR2Images();
  const categoryImages = allImages.filter((img) => img.category === category);
  const totalImages = categoryImages.length;
  const totalPages = Math.ceil(totalImages / IMAGES_PER_PAGE);

  if (totalImages === 0) {
    // Or handle as appropriate if category might not exist
    return {
      title: `Category: ${capitalizedCategoryName}`,
      description: `free printable ${displayCategoryName.toLowerCase()}.`,
    };
  }

  const pageTitle = `${capitalizedCategoryName}  - Free & Printable`;
  const pageDescription = `Explore dozens of free printable ${displayCategoryName.toLowerCase()}  for kids and adults. High-quality designs ready to download. Page 1 of ${totalPages}.`;
  const canonicalUrl = `${SITE_BASE_URL}/${category}`;

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
      type: "website", // or "object" if more appropriate for a category page
      images: [categoryImages[0]?.src || "/logo.png"], // Add a representative image if possible
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [categoryImages[0]?.src || "/logo.png"],
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const { category } = params;

  const allImages = await listAllR2Images();
  const categoryImages = allImages.filter((img) => img.category === category);

  if (categoryImages.length === 0 && category !== "_placeholder") {
    // Check for placeholder if used in generateStaticParams
    notFound();
  }

  categoryImages.sort((a, b) => a.name.localeCompare(b.name));

  const totalImages = categoryImages.length;
  const totalPages = Math.ceil(totalImages / IMAGES_PER_PAGE);
  const currentPage = 1; // This specific route is always page 1

  const startIndex = (currentPage - 1) * IMAGES_PER_PAGE;
  const endIndex = startIndex + IMAGES_PER_PAGE;
  const imagesForPage = categoryImages.slice(startIndex, endIndex);

  const nextPage = currentPage < totalPages ? currentPage + 1 : null;
  // prevPage is null for the base category page

  const displayCategoryName = category.replace(/-/g, " ");
  const capitalizedCategoryName =
    displayCategoryName.charAt(0).toUpperCase() + displayCategoryName.slice(1);
  const canonicalUrl = `${SITE_BASE_URL}/${category}`;

  // Structured Data for CollectionPage and ItemList
  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${capitalizedCategoryName} Coloring Pages - Page 1`,
    description: `Explore free printable ${displayCategoryName.toLowerCase()} coloring pages. Page 1 of ${totalPages}.`,
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
            thumbnailUrl: image.src, // Use main image src as thumbnail, or provide a specific one
            description: image.alt || `Coloring page of ${image.name}`,
            url: `${SITE_BASE_URL}/${category}/${imageSlug}`,
            isPartOf: { "@id": canonicalUrl }, // Points back to this CollectionPage
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
        <span className="text-gray-800 capitalize font-medium">
          {displayCategoryName}
        </span>
      </nav>

      {/* Header section */}
      <div className="mb-10 border-b border-gray-100 pb-6">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 capitalize">
          {capitalizedCategoryName}
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
            const titlePart = image.name.replace(/\s+/g, "-").toLowerCase();
            const filenamePart = image.key.split("/").pop() || "";
            const newSlug = `${titlePart}-${filenamePart}`;

            return (
              <Link
                key={image.key}
                href={`/${category}/${newSlug}`}
                className="group flex flex-col overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition-transform duration-200 hover:scale-[1.02] hover:shadow-md  focus-visible:outline-2 focus-visible:outline-blue-500"
                aria-label={`View coloring page: ${image.name}`}
              >
                <div className="aspect-square w-full relative bg-gray-50">
                  <Image
                    src={image.src}
                    alt={image.alt || `Coloring page of ${image.name}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-contain p-2"
                    loading="lazy"
                    placeholder="blur"
                    unoptimized={true}
                    blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='100%25' height='100%25' fill='%23f9fafb'/%3E%3C/svg%3E"
                  />
                </div>
                <div className="flex flex-col p-4 border-t border-gray-100">
                  <h3 className="font-medium text-gray-800 text-sm truncate group-hover:text-blue-600 mb-1">
                    {image.name}
                  </h3>
                  {image.alt &&
                    image.alt !== `Coloring page of ${image.name}` && (
                      <p className="text-gray-500 text-xs truncate">
                        {image.alt}
                      </p>
                    )}
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
