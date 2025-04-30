// types/index.ts

// Removed previous types (Tool, Point, CanvasRefs, ColouringImageInfo)

export interface R2ImageInfo {
  key: string; // Original R2 object key
  category: string;
  slug: string; // Derived from filename
  name: string; // Derived from filename
  src: string; // Public URL
  alt: string; // From R2 metadata
}

// Add other types if you need them later, e.g., for pagination state
