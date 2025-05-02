// File: [category]/[slug]/page.tsx
// File: app/[category]/[slug]/page.tsx
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { listAllR2Images } from "@/lib/r2"; // Import R2 function
import { notFound } from "next/navigation"; // Import notFound for handling missing images

// Generate static parameters for each image (category + slug combination)
export async function generateStaticParams() {
  const allImages = await listAllR2Images();
  console.log(
    `Generating static params for ${allImages.length} individual image pages.`
  );

  return allImages.map((image) => {
    // Create the new slug format: title-filename
    const titlePart = image.name.replace(/\s+/g, '-').toLowerCase();
    const filenamePart = image.key.split('/').pop() || '';
    const newSlug = `${titlePart}-${filenamePart}`;
    
    return {
      category: image.category,
      slug: newSlug, // Use the new slug format for the URL parameter
    };
  });
}

export default async function ImageDetailPage({
  params,
}: {
  params: { category: string; slug: string };
}) {
  const { category, slug } = params;

  // Fetch all images at build time (cached)
  const allImages = await listAllR2Images();
  
  // Extract the filename part from the slug (after the last dash)
  const slugParts = slug.split('-');
  const filenamePart = slugParts[slugParts.length - 1];
  
  // Find the image by matching category and filename part at the end of the key
  const image = allImages.find(
    (img) => img.category === category && img.key.endsWith(filenamePart)
  );

  // If the image is not found (e.g., invalid URL), return a 404 page
  if (!image) {
    console.warn(
      `Image not found for category: ${category}, slug: ${slug}. Returning 404.`
    );
    notFound();
  }

  // Format category name for display/breadcrumbs
  const displayCategoryName = category.replace(/-/g, " ");

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb Navigation with Apple-inspired styling */}
      <nav className="text-sm mb-8 flex items-center text-gray-500">
        <Link href="/" className="hover:text-blue-600 transition-colors">
          Home
        </Link>
        <svg className="w-3 h-3 mx-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
        <Link href={`/${category}`} className="hover:text-blue-600 transition-colors capitalize">
          {displayCategoryName}
        </Link>
        <svg className="w-3 h-3 mx-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-800">{image.name}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Left side - Image Container */}
        <div className="lg:w-2/3">
          <div className="apple-card overflow-hidden mb-6">
            <div className="w-full aspect-square lg:aspect-auto lg:h-[600px] relative">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 66vw, 50vw"
                className="object-contain p-6"
                unoptimized={true}
              />
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button className="apple-button flex items-center justify-center flex-1">
              <Download size={18} className="mr-2" /> Download
            </button>
            <button className="apple-secondary-button flex items-center justify-center flex-1">
              <Printer size={18} className="mr-2" /> Print Now
            </button>
          </div>
        </div>
        
        {/* Right side - Info */}
        <div className="lg:w-1/3">
          {/* Image Title */}
          <h1 className="text-3xl font-bold mb-6 text-gray-900">
            {image.name}
          </h1>
          
          {/* Image Description */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">
              About This Coloring Page
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {image.alt || `Beautiful ${image.name} coloring page for kids and adults. Print it out or download as a PDF and enjoy coloring this high-quality ${displayCategoryName} design.`}
            </p>
          </div>
          
          {/* Coloring Tips */}
          <div className="apple-card p-6 mb-8">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">
              Coloring Tips
            </h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Start with light colors and build up to darker shades
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Use quality coloring pencils or markers for best results
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Print on thicker paper to prevent bleeding
              </li>
            </ul>
          </div>
            
          {/* Back Link */}
          <Link
            href={`/${category}`}
            className="apple-secondary-button flex items-center justify-center w-full"
          >
            <ArrowLeft size={16} className="mr-2" /> Back to {displayCategoryName}
          </Link>
        </div> {/* Close Right side - Info */}
      </div> {/* Close flex container */}
    </div> // Close max-w-5xl container
  );
}