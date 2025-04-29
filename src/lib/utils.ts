// File: lib/utils.ts
import { ZoomPanState, Point } from "@/types"; // Ensure types are imported if used

// Basic hex to RGBA conversion
export function hexToRgba(
  hex: string,
  alpha: number = 255
): { r: number; g: number; b: number; a: number } | null {
  if (!hex) return null;
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: alpha,
      }
    : null;
}

// Removed rgbaToHex function (was only used by eyedropper)

// Check color similarity (adjust tolerance as needed)
export function areColorsSimilar(
  color1: Uint8ClampedArray | number[],
  color2: Uint8ClampedArray | number[],
  tolerance: number = 30
): boolean {
  if (color1.length < 3 || color2.length < 3) return false; // Ensure RGB components exist

  // Ignore alpha for similarity check if present (index 3)
  let diff = 0;
  diff += Math.abs(color1[0] - color2[0]); // Red
  diff += Math.abs(color1[1] - color2[1]); // Green
  diff += Math.abs(color1[2] - color2[2]); // Blue

  // Consider alpha difference more strictly if target is transparent
  if (color1.length > 3 && color2.length > 3) {
    // If the target color is transparent, only match other transparent pixels
    if (color1[3] < 10) {
      // Consider nearly transparent as transparent
      return color2[3] < 10;
    }
    // Otherwise, mostly ignore alpha unless the other pixel is fully transparent
    if (color2[3] < 10) return false; // Don't fill transparent areas if target isn't transparent
  } else if (color1.length <= 3 && color2.length > 3 && color2[3] < 10) {
    // Handle case where color1 is RGB and color2 is RGBA (transparent)
    return false;
  }

  return diff <= tolerance * 3; // Compare combined difference
}

// Get pixel data at a specific point
export function getPixelColor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
): Uint8ClampedArray {
  // Ensure coordinates are within canvas bounds
  const clampedX = Math.max(0, Math.min(x, ctx.canvas.width - 1));
  const clampedY = Math.max(0, Math.min(y, ctx.canvas.height - 1));
  // Use willReadFrequently context if possible for performance
  try {
    return ctx.getImageData(clampedX, clampedY, 1, 1).data;
  } catch (e) {
    console.error(
      "Error getting pixel data (is context willReadFrequently?):",
      e
    );
    // Return a default transparent color on error
    return new Uint8ClampedArray([0, 0, 0, 0]);
  }
}

// Removed getCanvasCoordinates function (replaced by getTransformedPoint in useZoomPan)

//--------End File---------
