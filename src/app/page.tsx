// File: page.tsx
// app/page.tsx
import Link from "next/link";
import { Palette } from "lucide-react"; // Use Palette icon instead of Folder
import { getR2Categories } from "@/lib/r2"; // Import the R2 function

export default async function HomePage() {
  const categories = await getR2Categories(); // Fetches categories at build time
  console.log(
    `\n--- HomePage: Rendering with ${
      categories.length
    } categories: [${categories.join(", ")}] ---\n`
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero section with clean, minimal design */}
      <div className="text-center py-16 mb-12">
        <h1 className="text-5xl font-bold mb-6 text-gray-900">
          Free Printable Coloring Pages
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Explore our collection of high-quality coloring pages for kids and
          adults. Print and unleash your creativity.
        </p>
      </div>

      {/* Categories section */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold mb-8 text-gray-800 text-center">
          Browse by Category
        </h2>

        {categories.length === 0 ? (
          <p className="text-gray-500 text-center">
            No categories found. Ensure R2 is configured and contains images in
            folders.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/${category}`} // Link to the category page
                className="apple-card group flex flex-col items-center py-8 hover:scale-[1.02]"
              >
                <Palette
                  size={40}
                  className="text-blue-600 mb-4"
                  strokeWidth={1.5}
                />
                <h3 className="text-xl font-medium text-gray-800 group-hover:text-blue-600 capitalize">
                  {/* Simple capitalization for display */}
                  {category.replace(/-/g, " ")}
                </h3>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Feature section */}
      <div className="bg-gray-50 rounded-2xl p-10 text-center mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          Why Choose Our Coloring Pages?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div>
            <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-blue-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">High Quality</h3>
            <p className="text-gray-600">
              Crisp, clean lines perfect for printing
            </p>
          </div>
          <div>
            <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-blue-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Free to Use</h3>
            <p className="text-gray-600">
              Download and print as many as you want
            </p>
          </div>
          <div>
            <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-blue-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Many Categories</h3>
            <p className="text-gray-600">
              Something for everyone in the family
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
