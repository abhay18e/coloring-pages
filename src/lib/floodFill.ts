import { areColorsSimilar } from "./utils";

interface FloodFillParams {
  ctx: CanvasRenderingContext2D; // Context to draw onto (color layer)
  baseCtx: CanvasRenderingContext2D; // Context to read from for boundaries (base image)
  startX: number;
  startY: number;
  fillColor: { r: number; g: number; b: number; a: number };
  tolerance?: number; // Tolerance for matching target color
  boundaryTolerance?: number; // Tolerance for detecting boundary colors
}

export function floodFill({
  ctx,
  baseCtx,
  startX,
  startY,
  fillColor,
  tolerance = 10,
  boundaryTolerance = 10, // Tolerance for boundary check
}: FloodFillParams): boolean {
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;
  const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  const baseImageData = baseCtx.getImageData(0, 0, canvasWidth, canvasHeight);
  const data = imageData.data;
  const baseData = baseImageData.data;

  const startNode = (startY * canvasWidth + startX) * 4;

  // --- Determine Target Color and Boundary Conditions ---
  // Target color is the color at the start position ON THE BASE IMAGE
  const targetColor = [
    baseData[startNode],
    baseData[startNode + 1],
    baseData[startNode + 2],
    baseData[startNode + 3],
  ];

  // Check if the start pixel on the COLOR layer already has the fill color (or similar)
  const currentColor = [
    data[startNode],
    data[startNode + 1],
    data[startNode + 2],
    data[startNode + 3],
  ];
  if (
    areColorsSimilar(
      currentColor,
      [fillColor.r, fillColor.g, fillColor.b, fillColor.a],
      5
    )
  ) {
    console.log("Start pixel already has fill color.");
    return false; // Already filled or too close
  }

  // --- Flood Fill Algorithm (Iterative Queue-based) ---
  const queue: [number, number][] = [];
  const visited = new Set<string>(); // Keep track of visited pixels

  function getPixelIndex(x: number, y: number): number {
    return (y * canvasWidth + x) * 4;
  }

  function isPixelValid(x: number, y: number): boolean {
    return x >= 0 && x < canvasWidth && y >= 0 && y < canvasHeight;
  }

  function shouldFillPixel(x: number, y: number): boolean {
    const index = getPixelIndex(x, y);
    const key = `${x},${y}`;

    if (!isPixelValid(x, y) || visited.has(key)) {
      return false;
    }

    // Check the BASE image for the target color
    const basePixelColor = [
      baseData[index],
      baseData[index + 1],
      baseData[index + 2],
      baseData[index + 3],
    ];
    if (!areColorsSimilar(basePixelColor, targetColor, tolerance)) {
      // Check if this non-target color should be considered a boundary
      // A boundary is usually a color significantly different from the target (e.g., black outlines)
      // This simple version treats ANY non-target color as a boundary.
      // A more advanced version might check if basePixelColor is significantly dark/opaque
      return false; // Hit a boundary or different color region on base layer
    }

    // Check the COLOR layer to ensure we aren't re-filling an already filled area (with the *current* fill color)
    // This prevents infinite loops if tolerance allows filling slightly different shades repeatedly.
    // However, it also prevents filling over a *previous* different color. This might be desired.
    // Let's comment this check out for now to allow painting over previous colors.
    /*
    const currentPixelColor = [data[index], data[index + 1], data[index + 2], data[index + 3]];
    if (areColorsSimilar(currentPixelColor, [fillColor.r, fillColor.g, fillColor.b, fillColor.a], 5)) {
        return false; // Already filled with the current color
    }
    */

    return true;
  }

  // Start the fill
  if (!shouldFillPixel(startX, startY)) {
    console.log("Start pixel is not fillable based on base image.");
    return false;
  }

  queue.push([startX, startY]);
  visited.add(`${startX},${startY}`);
  let filledPixelCount = 0;

  while (queue.length > 0) {
    const [x, y] = queue.shift()!;
    const index = getPixelIndex(x, y);

    // Set the color on the COLOR layer's data
    data[index] = fillColor.r;
    data[index + 1] = fillColor.g;
    data[index + 2] = fillColor.b;
    data[index + 3] = fillColor.a;
    filledPixelCount++;

    // Add neighbors to the queue
    const neighbors: [number, number][] = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ];

    for (const [nx, ny] of neighbors) {
      const key = `${nx},${ny}`;
      if (shouldFillPixel(nx, ny) && !visited.has(key)) {
        visited.add(key);
        queue.push([nx, ny]);
      }
    }

    // Optimization: Limit queue size to prevent potential browser freeze on huge areas
    if (queue.length > canvasWidth * canvasHeight) {
      console.warn("Flood fill queue exceeded maximum size. Stopping.");
      break;
    }
  }

  if (filledPixelCount > 0) {
    // Put the modified data back onto the color canvas
    ctx.putImageData(imageData, 0, 0);
    console.log(`Filled ${filledPixelCount} pixels.`);
    return true; // Indicate that filling occurred
  } else {
    console.log("No pixels were filled.");
    return false;
  }
}
