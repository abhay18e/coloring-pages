// File: hooks/useCanvasCore.ts
import { useRef, useState, useCallback, useEffect } from "react";
import { Tool, Point, ZoomPanState, CanvasRefs } from "@/types";
import { hexToRgba, getPixelColor } from "@/lib/utils";
import { floodFill } from "@/lib/floodFill";

const ERASER_SIZE = 20; // Pixel radius for eraser

export function useCanvasCore(
  imageSrc: string | null,
  initialColor: string,
  initialTool: Tool
) {
  const baseCanvasRef = useRef<HTMLCanvasElement>(null);
  const colorCanvasRef = useRef<HTMLCanvasElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);

  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>(initialColor);
  const [selectedTool, setSelectedTool] = useState<Tool>(initialTool);

  const isDraggingRef = useRef(false);

  useEffect(() => {
    setSelectedTool(initialTool);
  }, [initialTool]);

  useEffect(() => {
    setSelectedColor(initialColor);
  }, [initialColor]);

  const redrawDisplayCanvas = useCallback(
    (currentZoomPan: ZoomPanState) => {
      if (
        !displayCanvasRef.current ||
        !baseCanvasRef.current ||
        !colorCanvasRef.current ||
        !imageSize
      )
        return;
      const displayCtx = displayCanvasRef.current.getContext("2d");
      if (!displayCtx) return;

      // Apply pixelated rendering for sharp edges when scaling up
      const pixelated = currentZoomPan.scale > 1.5; // Adjust threshold as needed
      displayCtx.imageSmoothingEnabled = !pixelated;
      // Add vendor prefixes if needed for broader compatibility, though less common now
      // (displayCtx as any).mozImageSmoothingEnabled = !pixelated; // Firefox
      // (displayCtx as any).webkitImageSmoothingEnabled = !pixelated; // Webkit
      // (displayCtx as any).msImageSmoothingEnabled = !pixelated; // IE

      displayCtx.setTransform(1, 0, 0, 1, 0, 0);
      displayCtx.clearRect(
        0,
        0,
        displayCtx.canvas.width,
        displayCtx.canvas.height
      );

      displayCtx.translate(currentZoomPan.offset.x, currentZoomPan.offset.y);
      displayCtx.scale(currentZoomPan.scale, currentZoomPan.scale);

      // Always draw base image (outlines)
      if (baseCanvasRef.current) {
        displayCtx.drawImage(
          baseCanvasRef.current,
          0,
          0,
          imageSize.width,
          imageSize.height
        );
      }

      // Draw color layer on top
      if (colorCanvasRef.current) {
        displayCtx.drawImage(
          colorCanvasRef.current,
          0,
          0,
          imageSize.width,
          imageSize.height
        );
      }
    },
    [imageSize] // imageSize is the primary dependency here
  );

  useEffect(() => {
    // --- Image Loading Effect ---
    if (
      !imageSrc ||
      !baseCanvasRef.current ||
      !colorCanvasRef.current ||
      !displayCanvasRef.current
    ) {
      setImageSize(null);
      // Clear canvases if imageSrc becomes null
      baseCanvasRef.current
        ?.getContext("2d")
        ?.clearRect(
          0,
          0,
          baseCanvasRef.current.width,
          baseCanvasRef.current.height
        );
      colorCanvasRef.current
        ?.getContext("2d")
        ?.clearRect(
          0,
          0,
          colorCanvasRef.current.width,
          colorCanvasRef.current.height
        );
      displayCanvasRef.current
        ?.getContext("2d")
        ?.clearRect(
          0,
          0,
          displayCanvasRef.current.width,
          displayCanvasRef.current.height
        );
      return;
    }
    console.log("useCanvasCore: Image source changed, loading:", imageSrc); // Debug log
    setIsImageLoading(true);
    const baseCtx = baseCanvasRef.current.getContext("2d", {
      willReadFrequently: true, // Needed for flood fill boundary check
    });
    const colorCtx = colorCanvasRef.current.getContext("2d", {
      willReadFrequently: true, // Needed for flood fill checking current color
    });
    const displayCtx = displayCanvasRef.current.getContext("2d");

    if (!baseCtx || !colorCtx || !displayCtx) {
      console.error("useCanvasCore: Failed to get canvas contexts");
      setIsImageLoading(false);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous"; // Keep for potential external images
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      console.log(`useCanvasCore: Image loaded successfully (${w}x${h})`); // Debug log
      setImageSize({ width: w, height: h });

      [
        baseCanvasRef.current,
        colorCanvasRef.current,
        displayCanvasRef.current,
      ].forEach((canvas) => {
        if (canvas) {
          canvas.width = w;
          canvas.height = h;
          canvas.style.width = "";
          canvas.style.height = "";
        }
      });

      baseCtx.clearRect(0, 0, w, h);
      baseCtx.drawImage(img, 0, 0, w, h);

      colorCtx.clearRect(0, 0, w, h); // Clear color layer for new image

      setIsImageLoading(false);
      // We rely on the CanvasArea effect triggered by imageSize change + fitToScreen
      // to perform the initial draw correctly zoomed/panned.
    };
    img.onerror = (err) => {
      console.error("useCanvasCore: Failed to load image:", imageSrc, err); // Debug log
      setIsImageLoading(false);
      setImageSize(null);
      alert(
        "Failed to load image. Please try another one or check the URL/file."
      );
    };
    img.src = imageSrc;

    return () => {
      console.log("useCanvasCore: Cleanup effect for image:", imageSrc); // Debug log
      baseCtx?.clearRect(0, 0, baseCtx.canvas.width, baseCtx.canvas.height);
      colorCtx?.clearRect(0, 0, colorCtx.canvas.width, colorCtx.canvas.height);
      displayCtx?.clearRect(
        0,
        0,
        displayCtx.canvas.width,
        displayCtx.canvas.height
      );
    };
  }, [imageSrc]); // Rerun only when imageSrc changes

  const fillArea = useCallback(
    (point: Point): boolean => {
      // Return boolean to indicate if action occurred
      if (!colorCanvasRef.current || !baseCanvasRef.current || !imageSize)
        return false;
      const colorCtx = colorCanvasRef.current.getContext("2d");
      const baseCtx = baseCanvasRef.current.getContext("2d");
      if (!colorCtx || !baseCtx) return false;

      const rgba = hexToRgba(selectedColor);
      if (!rgba) return false;

      const filled = floodFill({
        // Assuming floodFill returns boolean
        ctx: colorCtx,
        baseCtx: baseCtx,
        startX: point.x,
        startY: point.y,
        fillColor: rgba,
        tolerance: 20,
      });
      return filled; // Return success/failure
    },
    [selectedColor, imageSize]
  );

  const eraseAtPoint = useCallback(
    (point: Point) => {
      if (!colorCanvasRef.current || !imageSize) return;
      const ctx = colorCanvasRef.current.getContext("2d");
      if (!ctx) return;

      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(point.x, point.y, ERASER_SIZE / 2, 0, Math.PI * 2, false);
      ctx.fill();
      ctx.restore();
    },
    [imageSize]
  );

  // Modified handleCanvasInteraction
  const handleCanvasInteraction = useCallback(
    (
      event: React.MouseEvent<HTMLCanvasElement>,
      transformedPoint: Point | null,
      zoomPanState: ZoomPanState, // Receive current zoomPan state
      actionType: "down" | "move" | "up"
    ) => {
      if (isImageLoading || !transformedPoint) return;

      const currentTool = selectedTool;
      let needsRedraw = false; // Flag to track if redraw is needed

      if (actionType === "down") {
        isDraggingRef.current = true;
        if (currentTool === "fill") {
          if (fillArea(transformedPoint)) {
            // Check if fill actually happened
            needsRedraw = true;
          }
          isDraggingRef.current = false; // Fill is instant, not a drag
        } else if (currentTool === "erase") {
          eraseAtPoint(transformedPoint);
          needsRedraw = true; // Redraw on first erase point
        } else {
          isDraggingRef.current = false; // Not a drawing tool
        }
      } else if (actionType === "move") {
        if (isDraggingRef.current && currentTool === "erase") {
          eraseAtPoint(transformedPoint);
          needsRedraw = true; // Redraw as eraser moves
        }
      } else if (actionType === "up") {
        if (isDraggingRef.current && currentTool === "erase") {
          // Optional: could potentially skip redraw if no move happened since down,
          // but redrawing on up ensures final state is shown reliably.
          needsRedraw = true;
        }
        isDraggingRef.current = false;
      }

      // If any action modified the canvas, trigger redraw immediately
      if (needsRedraw) {
        redrawDisplayCanvas(zoomPanState);
      }
    },
    [
      isImageLoading,
      selectedTool,
      fillArea,
      eraseAtPoint,
      redrawDisplayCanvas, // Add redrawDisplayCanvas as a dependency
    ]
  );

  const canvasRefs: CanvasRefs = {
    baseCanvasRef,
    colorCanvasRef,
    displayCanvasRef,
  };

  return {
    canvasRefs,
    isImageLoading,
    imageSize,
    redrawDisplayCanvas, // Still export for CanvasArea effect
    handleCanvasInteraction,
  };
}
//--------End File---------
