// File: lib/r2.ts
// lib/r2.ts
import {
  S3Client,
  ListObjectsV2Command,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { R2ImageInfo } from "@/types"; // Assuming types/index.ts is in place

// --- R2 Configuration ---
// These variables are used for the S3 API connection (listing objects, getting metadata)
// They are read from environment variables (.env.local in dev, Cloudflare Pages settings in production)
const R2_ACCOUNT_ID =
  process.env.R2_ACCOUNT_ID || "<YOUR_CLOUDFLARE_ACCOUNT_ID>";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
export const R2_BUCKET_NAME =
  process.env.R2_BUCKET_NAME || "<YOUR_R2_BUCKET_NAME>";

// --- Public URL Configuration ---
// This variable holds the FULL public URL base for accessing objects directly via browser.
// This should be the value you confirmed works, e.g., "https://pub-YOUR_PUBLIC_KEY.r2.dev/YOUR_BUCKET_NAME"
// It's read from environment variables.
const R2_PUBLIC_URL_BASE = process.env.R2_PUBLIC_URL_BASE || "";

// --- Debug: Log Environment Variables ---
/*
console.log("--- R2 Configuration Check (Debug) ---");
console.log(`R2_ACCOUNT_ID: ${R2_ACCOUNT_ID ? "Loaded" : "MISSING"}`);
console.log(`R2_ACCESS_KEY_ID: ${R2_ACCESS_KEY_ID ? "Loaded" : "MISSING"}`);
console.log(
  `R2_SECRET_ACCESS_KEY: ${R2_SECRET_ACCESS_KEY ? "Loaded" : "MISSING"}`
);
console.log(`R2_BUCKET_NAME: ${R2_BUCKET_NAME ? "Loaded" : "MISSING"}`);
console.log(`R2_PUBLIC_URL_BASE: ${R2_PUBLIC_URL_BASE ? "Loaded" : "MISSING"}`); // Debug the crucial public URL variable
console.log("--------------------------------------");
*/
// Ensure essential API variables are available
if (
  !R2_ACCOUNT_ID ||
  !R2_ACCESS_KEY_ID ||
  !R2_SECRET_ACCESS_KEY ||
  !R2_BUCKET_NAME
) {
  console.warn(
    "R2 API credentials or bucket name missing. R2 API functions will return empty results or fail."
  );
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "R2 API environment variables (ACCOUNT_ID, ACCESS_KEY_ID, SECRET_ACCESS_KEY, BUCKET_NAME) are not fully configured for production build."
    );
  }
}

// Also check the public URL base variable, which is essential for image display
if (!R2_PUBLIC_URL_BASE) {
  console.warn(
    "R2_PUBLIC_URL_BASE environment variable is missing. Public image URLs cannot be generated."
  );
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "R2_PUBLIC_URL_BASE environment variable is not configured for production build."
    );
  }
}

// The R2 API endpoint for S3-compatible operations requires the Account ID
const R2_API_ENDPOINT = R2_ACCOUNT_ID
  ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
  : "API_ENDPOINT_MISSING"; // Placeholder if config is missing

// --- Configure S3 client for API operations ---
// Initialize only if API credentials seem present
const s3Client =
  R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_ACCOUNT_ID
    ? new S3Client({
        region: "auto", // Cloudflare R2 uses "auto"
        endpoint: R2_API_ENDPOINT, // Use the API endpoint
        credentials: {
          accessKeyId: R2_ACCESS_KEY_ID,
          secretAccessKey: R2_SECRET_ACCESS_KEY,
        },
      })
    : undefined;

console.log(`S3 Client Initialized for API calls: ${!!s3Client}`);

// File: lib/r2.ts
// ... (keep imports, R2 Configuration, S3 client setup, etc. as before) ...

// --- Function to list all objects in the bucket and get their metadata ---
export async function listAllR2Images(): Promise<R2ImageInfo[]> {
  // --- Debug: Check if S3 client is available and public URL base is set ---
  if (!s3Client) {
    console.warn(
      "S3 Client is not initialized due to missing R2 API credentials. Cannot list images."
    );
    return [];
  }
  if (!R2_PUBLIC_URL_BASE || R2_PUBLIC_URL_BASE === "PUBLIC_URL_BASE_MISSING") {
    console.warn(
      "R2_PUBLIC_URL_BASE is missing or invalid. Cannot generate public URLs for images."
    );
    return [];
  }

  console.log("--- Listing R2 Bucket Contents (Debug) ---");
  const allImages: R2ImageInfo[] = [];
  let continuationToken: string | undefined;
  let page = 0;

  try {
    do {
      page++;
      console.log(`Fetching page ${page} of bucket listing...`);

      // Use ListObjectsV2Command to get a flat list of all objects
      const command = new ListObjectsV2Command({
        Bucket: R2_BUCKET_NAME, // API command needs the bucket name
        ContinuationToken: continuationToken,
      });

      console.log(`Sending ListObjectsV2Command with params:`, command.input);
      const response = await s3Client.send(command);

      // --- Debug: Log the raw response for this page ---
      console.log(`--- Raw API Response Page ${page} ---`);
      console.log(`IsTruncated: ${response.IsTruncated}`);
      console.log(`NextContinuationToken: ${response.NextContinuationToken}`);
      console.log(`KeyCount: ${response.KeyCount}`);
      console.log(`Contents count: ${response.Contents?.length || 0}`);
      console.log(
        "Contents (Object Keys):",
        response.Contents?.map((obj) => obj.Key)
      );
      console.log("-----------------------------------");

      // Process objects (files) found in the 'Contents' list
      if (response.Contents) {
        console.log(
          `Processing ${response.Contents.length} objects (files) on page ${page}...`
        );
        for (const object of response.Contents) {
          const key = object.Key;
          if (!key) {
            console.log("Skipping object with no key.");
            continue;
          }
          if (key.endsWith("/")) {
            console.log(`Skipping directory key: ${key}`);
            continue;
          }

          // Extract category and filename from the full object key
          const parts = key.split("/");
          let category = "uncategorized";
          let fileName = key; // Fallback filename is the whole key

          if (parts.length > 1) {
            category = parts[0];
            fileName = parts[parts.length - 1]; // The last part is the filename
            console.log(
              `Key "${key}" parsed: category='${category}', fileName='${fileName}' (fallback name).`
            );
          } else {
            console.log(
              `Key "${key}" has no '/', treating as uncategorized file. Fallback name: '${fileName}'.`
            );
          }

          // Generate a slug from the filename (slug should usually be based on filename for URL consistency)
          const slug = fileName
            .replace(/\.[^/.]+$/, "") // Remove file extension
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

          // Fetch metadata for title and alt text
          try {
            const headCommand = new HeadObjectCommand({
              Bucket: R2_BUCKET_NAME,
              Key: key,
            });
            const headResponse = await s3Client.send(headCommand);

            // *** UPDATED: Fetch 'title' from metadata, fallback to fileName ***
            // R2 metadata keys are typically lowercase, e.g., 'title', 'alt'
            const nameFromMetadata = headResponse.Metadata?.title || fileName; // Use 'title' metadata or the derived filename as fallback
            const alt =
              headResponse.Metadata?.alt || `Image in ${category} category`; // Use 'alt' metadata or a default

            const publicSrc = `${R2_PUBLIC_URL_BASE}/${key}`;
            //console.log(`Generated public URL for ${key}: ${publicSrc}`);

            allImages.push({
              category: category,
              slug: slug,
              name: nameFromMetadata, // *** USE THE FETCHED/FALLBACK NAME ***
              src: publicSrc,
              alt: alt,
              key: key,
            });
          } catch (headError: any) {
            console.error(
              `Failed to get metadata for ${key}:`,
              headError.message
            );
            // If metadata fetch fails, use filename as name and a default alt text
            const publicSrc = `${R2_PUBLIC_URL_BASE}/${key}`;
            allImages.push({
              category: category,
              slug: slug,
              name: fileName, // *** FALLBACK TO FILENAME ON ERROR ***
              src: publicSrc,
              alt: `Image in ${category} category (metadata fetch failed)`,
              key: key,
            });
          }
        }
      } else {
        console.log(
          `No Contents array found in response page ${page}. This page returned no file objects.`
        );
      }

      continuationToken = response.NextContinuationToken;
      console.log(
        `End of page ${page}. NextContinuationToken: ${continuationToken}`
      );
    } while (continuationToken);
  } catch (error: any) {
    console.error("!!! Error listing R2 objects !!!", error);
    console.error("Error details:", {
      message: error.message,
      code: error.Code,
      statusCode: error.$metadata?.httpStatusCode,
    });
    throw new Error("Failed to fetch image list from R2: " + error.message);
  }

  // --- Debug: Final Summary ---
  console.log(`--- R2 Listing Complete ---`);
  console.log(`Successfully listed and processed ${allImages.length} images.`);
  const foundCategories = Array.from(
    new Set(allImages.map((img) => img.category))
  ).sort();
  console.log(
    `Categories found from processed images: ${
      foundCategories.join(", ") || "None"
    }`
  );
  console.log("---------------------------");

  return allImages;
}

// --- Function to get unique categories ---
// This function uses the results from listAllR2Images to find unique category names.
export async function getR2Categories(): Promise<string[]> {
  console.log("Attempting to get unique categories from processed images...");
  try {
    // Call listAllR2Images, which includes debug logs
    const images = await listAllR2Images();
    const categories = new Set<string>();

    // Iterate through the collected images and add their categories to a Set (auto-handles uniqueness)
    images.forEach((img) => {
      // Add basic validation for the category name
      if (
        img.category &&
        img.category.trim() !== "" &&
        img.category !== "uncategorized"
      ) {
        categories.add(img.category);
      } else if (img.category === "uncategorized") {
        console.log(`Skipping 'uncategorized' category for display.`);
      } else {
        console.warn(
          `Skipping image with empty/invalid category during category extraction (key: ${img.key}).`
        );
      }
    });

    // Convert the Set to an Array and sort alphabetically
    const sortedCategories = Array.from(categories).sort();
    console.log(
      `Found ${sortedCategories.length} unique categories after processing images.`
    );
   // console.log("Categories found:", sortedCategories);
    return sortedCategories;
  } catch (error) {
    console.error("Error in getR2Categories:", error);
    // If listAllR2Images threw an error, this catch block will be hit.
    // Return empty array or re-throw depending on desired error handling behavior.
    return []; // Return empty array if listing failed
  }
}

// Ensure types/index.ts exists and defines R2ImageInfo
// Example types/index.ts:
/*
export interface R2ImageInfo {
  key: string; // Original R2 object key
  category: string; // Derived from the first part of the key path
  slug: string; // Derived from the filename part of the key
  name: string; // The filename part of the key
  src: string; // The full public URL
  alt: string; // From R2 metadata or default
}
*/
