// File: app/[category]/[slug]/page.tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listAllR2Images } from "@/lib/r2";
import { notFound } from "next/navigation";
import ImageContainer from "./ImageContainer"; // Import the client component
import { Metadata } from "next";
import { R2ImageInfo } from "@/types";

const SITE_BASE_URL = "https://freecoloringpages.fun";

// Generate static parameters for each image (category + slug combination)
export async function generateStaticParams() {
  const allImages = await listAllR2Images();
  console.log(
    `Generating static params for ${allImages.length} individual image pages.`
  );

  // Characters to sanitise: : * ? " < > | \ /
  const sanitize = (str: string) =>
    str.replace(/[:*?"<>|\\/]/g, "-");

  return allImages.map((image) => {
    const titlePart = sanitize(image.name.replace(/\s+/g, "-").toLowerCase());
    const filenamePart = sanitize(image.key.split("/").pop()?.toLowerCase() || "");
    const newSlug = `${titlePart}-${filenamePart}`;

    return {
      category: image.category,
      slug: newSlug,
    };
  });
}

// Find image helper (used in generateMetadata and Page component)
async function getImageData(
  category: string,
  slug: string
): Promise<R2ImageInfo | null> {
  const allImages = await listAllR2Images();
  // Extract the filename part from the slug (after the last dash, assuming consistent slug generation)
  const slugParts = slug.split("-");
  // The filename part in the slug could be complex if original filename also had hyphens.
  // A safer way to get the original filename part used to create the slug:
  // Iterate through possible splits, as titlePart could contain hyphens.
  let foundImage: R2ImageInfo | null = null;

  for (let i = slugParts.length - 1; i >= 0; i--) {
    const potentialFilenamePart = slugParts.slice(i).join("-");
    const image = allImages.find((img) => {
      const imgFilename = img.key.split("/").pop()?.toLowerCase();
      return img.category === category && imgFilename === potentialFilenamePart;
    });
    if (image) {
      // Verify if the prepended title part matches the image name part of the slug
      const reconstructedTitlePart = image.name
        .replace(/\s+/g, "-")
        .toLowerCase();
      const expectedSlugPrefix = reconstructedTitlePart;
      const actualSlugPrefix = slugParts.slice(0, i).join("-");

      if (actualSlugPrefix === expectedSlugPrefix) {
        foundImage = image;
        break;
      }
    }
  }
  // Fallback: original simpler logic if the above is too complex or fails
  if (!foundImage) {
    const filenamePartFromSlug = slugParts[slugParts.length - 1];
    foundImage = allImages.find(
      (img) =>
        img.category === category &&
        img.key.toLowerCase().endsWith(filenamePartFromSlug)
    );
  }
  return foundImage;
}

// Generate metadata for individual image pages
export async function generateMetadata({
  params,
}: {
  params: { category: string; slug: string };
}): Promise<Metadata> {
  const { category, slug } = params;
  const image = await getImageData(category, slug);

  if (!image) {
    return {
      title: "Image Not Found",
      alternates: { canonical: `${SITE_BASE_URL}/${category}` }, // Canonical to category page
    };
  }

  const displayCategoryName = category.replace(/-/g, " ");
  const capitalizedCategoryName =
    displayCategoryName.charAt(0).toUpperCase() + displayCategoryName.slice(1);

  const pageTitle = `${image.name} - ${capitalizedCategoryName} `;
  const pageDescription = `Download or print the "${
    image.name
  }" . A free, high-quality printable from our ${displayCategoryName.toLowerCase()} collection.`;
  const canonicalUrl = `${SITE_BASE_URL}/${category}/${slug}`;

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
      type: "article", // 'article' or 'product' might be suitable for an image page
      images: [
        {
          url: image.src, // Ensure this is an absolute URL
          width: 800, // Provide dimensions if known
          height: 600,
          alt: image.alt || image.name,
        },
      ],
      
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [image.src], // Ensure this is an absolute URL
    },
  };
}

export default async function ImageDetailPage({
  params,
}: {
  params: { category: string; slug: string };
}) {
  const { category, slug } = params;
  const image = await getImageData(category, slug);

  if (!image) {
    console.warn(
      `Image not found for category: ${category}, slug: ${slug}. Returning 404.`
    );
    notFound();
  }

  const displayCategoryName = category.replace(/-/g, " ");
  const canonicalUrl = `${SITE_BASE_URL}/${category}/${slug}`;

  // Structured Data for ImageObject
  const imageObjectSchema = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    name: image.name,
    description:
      image.alt ||
      `High-quality printable coloring page: ${image.name}. Part of the ${displayCategoryName} category.`,
    contentUrl: image.src,
    thumbnailUrl: image.src, // Use main image URL or a specific thumbnail if available
    license: "https://freecoloringpages.fun/terms", // Link to your terms or a Creative Commons license
    acquireLicensePage: canonicalUrl,
    creator: {
      "@type": "Organization",
      name: "FreeColoringPages.fun",
      url: SITE_BASE_URL,
    },
    copyrightHolder: {
      "@type": "Organization",
      name: "FreeColoringPages.fun",
      url: SITE_BASE_URL,
    },
    // "datePublished": "2023-01-01T08:00:00+08:00", // Use actual image publish date if available
    keywords: `${category}, coloring page, printable, ${image.name
      .toLowerCase()
      .split(" ")
      .join(", ")}`,
    isPartOf: {
      "@type": "CollectionPage",
      name: `${
        displayCategoryName.charAt(0).toUpperCase() +
        displayCategoryName.slice(1)
      } Coloring Pages`,
      url: `${SITE_BASE_URL}/${category}`,
    },
  };

  return (
    <div className="max-w-5xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageObjectSchema) }}
      />
      {/* Breadcrumb Navigation */}
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
        <span className="text-gray-800">{image.name}</span>
      </nav>
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Left side - Image Container - Client Component */}
        <ImageContainer image={image} />
        {/* Right side - Info */}
        <div className="lg:w-1/3">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">
            {image.name}
          </h1>
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">
              About This Coloring Page
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {image.alt ||
                `Beautiful ${image.name} coloring page for kids and adults. Print it out or download and enjoy coloring this high-quality ${displayCategoryName} design.`}
            </p>
          </div>
          <div className="apple-card p-6 mb-8">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">
              Coloring Tips
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Start with light colors and build up to darker shades.
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Use quality coloring pencils or markers for best results.
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Print on thicker paper to prevent bleeding.
              </li>
            </ul>
          </div>
          <Link
            href={`/${category}`}
            className="apple-secondary-button flex items-center justify-center w-full"
          >
            <ArrowLeft size={16} className="mr-2" /> Back to{" "}
            {displayCategoryName}
          </Link>
        </div>
      </div>
    </div>
  );
}
