// app/page.tsx
import Link from "next/link";
import { Folder } from "lucide-react"; // Use Folder icon
import { getR2Categories } from "@/lib/r2"; // Import the R2 function

export default async function HomePage() {
  const categories = await getR2Categories(); // Fetches categories at build time
  console.log(`\n\n\n\n categories::  ${categories}\n\n\n\n\n`)

  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold mb-4 text-gray-800">
        Welcome to the Image Gallery
      </h1>
      <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
        Explore images organized by category, powered by Cloudflare R2.
      </p>

      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Categories</h2>

      {categories.length === 0 ? (
        <p className="text-gray-500">
          No categories found. Ensure R2 is configured and contains images in
          folders.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/${category}`} // Link to the category page
              className="group block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 text-center"
            >
              <Folder size={48} className="mx-auto mb-3 text-blue-500" />
              <h3 className="text-xl font-semibold mb-2 text-gray-700 group-hover:text-blue-600 capitalize">
                {/* Simple capitalization for display */}
                {category.replace(/-/g, " ")}
              </h3>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
