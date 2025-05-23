// File: page.tsx
// app/page.tsx
import Link from "next/link";
import { Palette, Download, Heart, Star } from "lucide-react";
import { getR2Categories } from "@/lib/r2";

export default async function HomePage() {
  const categories = await getR2Categories();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero section with enhanced design */}
        <div className="text-center py-20 mb-16 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-32 right-16 w-16 h-16 bg-purple-200 rounded-full opacity-30 animate-pulse delay-1000"></div>
          <div className="absolute bottom-10 left-1/4 w-12 h-12 bg-pink-200 rounded-full opacity-25 animate-pulse delay-500"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-8 transform rotate-12 hover:rotate-0 transition-transform duration-500">
              <Palette size={32} className="text-white" />
            </div>

            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
              Free Printable
              <br />
              <span className="text-5xl md:text-6xl">Coloring Pages</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              Discover thousands of high-quality coloring pages for kids and
              adults.
              <br className="hidden md:block" />
              <span className="text-blue-600 font-medium">
                Print instantly
              </span>{" "}
              and unleash your creativity.
            </p>

            {/* Stats section */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              <div className="flex items-center space-x-3 bg-white/70 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="font-semibold text-gray-700">
                  Premium Quality
                </span>
              </div>
              <div className="flex items-center space-x-3 bg-white/70 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                <Download className="w-5 h-5 text-green-500" />
                <span className="font-semibold text-gray-700">
                  Instant Download
                </span>
              </div>
              <div className="flex items-center space-x-3 bg-white/70 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                <Heart className="w-5 h-5 text-red-500 fill-current" />
                <span className="font-semibold text-gray-700">100% Free</span>
              </div>
            </div>
          </div>
        </div>

        {/* Categories section with enhanced cards */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-800">
              Browse by Category
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">
                No categories found. Ensure R2 is configured and contains images
                in folders.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {categories.map((category, index) => (
                <Link
                  key={category}
                  href={`/${category}`}
                  className="group relative overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 border border-white/50 group-hover:border-blue-200">
                    {/* Gradient background on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>

                    <div className="relative z-10 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Palette
                          size={28}
                          className="text-blue-600 group-hover:text-purple-600 transition-colors duration-300"
                          strokeWidth={1.5}
                        />
                      </div>

                      <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-300 capitalize mb-2">
                        {category.replace(/-/g, " ")}
                      </h3>

                      <div className="w-0 group-hover:w-12 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto transition-all duration-500 rounded-full"></div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Enhanced feature section */}
        <div className="relative mb-20">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/50 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-100 to-yellow-100 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>

            <div className="relative z-10 text-center">
              <h2 className="text-4xl font-bold mb-4 text-gray-800">
                Why Choose Our Coloring Pages?
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full mb-12"></div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                <div className="group">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-10 h-10 text-green-600"
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
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-800">
                    Premium Quality
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    Crisp, clean lines and detailed designs perfect for printing
                    at any size
                  </p>
                </div>

                <div className="group">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-10 h-10 text-blue-600"
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
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-800">
                    Completely Free
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    Download and print unlimited pages without any cost or
                    registration
                  </p>
                </div>

                <div className="group">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg
                        className="w-10 h-10 text-purple-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-800">
                    Diverse Collection
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    Hundreds of categories and themes for all ages and skill
                    levels
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to action section */}
        <div className="text-center pb-20">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl p-12 text-white shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Start Coloring Today!
            </h2>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              Join thousands of happy colorists and discover your next
              masterpiece
            </p>
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-8 py-4 text-lg font-semibold hover:bg-white/30 transition-all duration-300 cursor-pointer">
              <Palette className="w-6 h-6" />
              <span>Browse Categories Above</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
