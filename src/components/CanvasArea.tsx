// File: components/CanvasArea.tsx
import React, { useRef, useEffect, useCallback } from "react";
import { Tool, Point, ZoomPanState, CanvasRefs } from "@/types"; // Import types

interface CanvasAreaProps {
  imageSrc: string | null;
  selectedColor: string; // Still needed for interaction logic
  selectedTool: Tool; // Still needed for interaction logic
  // Removed onColorPick and onToolSelect props

  // --- Props passed down from HomePage ---
  zoomPan: ZoomPanState;
  zoom: (deltaY: number, mousePos?: Point | undefined) => void;
  startPan: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  pan: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  endPan: () => void;
  getTransformedPoint: (
    event: React.MouseEvent<HTMLCanvasElement>
  ) => Point | null;
  isPanning: boolean;
  canvasRefs: CanvasRefs; // Refs managed by useCanvasCore in HomePage
  handleCanvasInteraction: (
    event: React.MouseEvent<HTMLCanvasElement>,
    transformedPoint: Point | null,
    zoomPanState: ZoomPanState,
    actionType: "down" | "move" | "up"
  ) => void; // Core interaction logic
  redrawDisplayCanvas: (currentZoomPan: ZoomPanState) => void; // Core redraw logic
  isImageLoading: boolean;
  // Removed showOutlines prop
  // Removed redrawRequest prop
}

const CanvasArea: React.FC<CanvasAreaProps> = ({
  imageSrc,
  selectedColor, // Use prop directly
  selectedTool, // Use prop directly
  // Removed onColorPick, onToolSelect
  // Destructure props from HomePage
  zoomPan,
  zoom,
  startPan,
  pan,
  endPan,
  getTransformedPoint,
  isPanning,
  canvasRefs,
  handleCanvasInteraction,
  redrawDisplayCanvas,
  isImageLoading,
  // Removed showOutlines, redrawRequest
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // Get refs from props
  const { baseCanvasRef, colorCanvasRef, displayCanvasRef } = canvasRefs;

  // Effect to redraw canvas when zoom/pan state or image changes
  // Simplified dependencies: removed showOutlines, redrawRequest
  useEffect(() => {
    // Only redraw if not loading and image source exists (implies imageSize is likely set)
    if (!isImageLoading && imageSrc) {
      redrawDisplayCanvas(zoomPan);
    }
    // Redraw whenever zoom/pan changes or image source changes
  }, [zoomPan, redrawDisplayCanvas, isImageLoading, imageSrc]);

  // ----- Event Handlers -----

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (selectedTool === "pan") {
        startPan(event); // Use handler from props
      } else {
        // Use getTransformedPoint from props
        const point = getTransformedPoint(event);
        // Use handleCanvasInteraction from props, passing the current zoomPan state
        handleCanvasInteraction(event, point, zoomPan, "down");

        // Removed Eyedropper logic
      }
    },
    [
      selectedTool,
      startPan,
      getTransformedPoint,
      handleCanvasInteraction,
      zoomPan,
      // Removed onToolSelect
    ]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (selectedTool === "pan" && isPanning) {
        // Check isPanning from props
        pan(event); // Use handler from props
        // Redraw is triggered by the useEffect watching zoomPan state
      } else if (selectedTool !== "pan" && event.buttons === 1) {
        // Check if mouse button is down for non-pan tools
        // Use getTransformedPoint from props
        const point = getTransformedPoint(event);
        // Use handleCanvasInteraction from props
        handleCanvasInteraction(event, point, zoomPan, "move");
      }
    },
    [
      selectedTool,
      isPanning, // Use from props
      pan, // Use from props
      getTransformedPoint, // Use from props
      handleCanvasInteraction, // Use from props
      zoomPan,
      // redrawDisplayCanvas // Redraw now handled by effect watching zoomPan
    ]
  );

  const handleMouseUp = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (selectedTool === "pan") {
        endPan(); // Use handler from props
      } else {
        const point = getTransformedPoint(event); // Use from props
        // Use handleCanvasInteraction from props
        handleCanvasInteraction(event, point, zoomPan, "up");
      }
    },
    [
      selectedTool,
      endPan, // Use handler from props
      getTransformedPoint, // Use from props
      handleCanvasInteraction, // Use from props
      zoomPan,
    ]
  );

  const handleMouseLeave = useCallback(() => {
    // End panning if mouse leaves canvas
    if (isPanning) {
      endPan(); // Use handler from props
    }
    // Also trigger 'up' for tools like eraser if dragging mouse leaves
    const dummyEvent = {} as React.MouseEvent<HTMLCanvasElement>; // Create dummy event if needed
    const point = null; // No specific point on leave
    handleCanvasInteraction(dummyEvent, point, zoomPan, "up"); // Trigger the 'up' logic for cleanup
  }, [isPanning, endPan, handleCanvasInteraction, zoomPan]); // Add isPanning dependency

  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLCanvasElement>) => {
      event.preventDefault(); // Prevent page scroll
      const rect = displayCanvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mousePos = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      zoom(event.deltaY, mousePos); // Use zoom from props
      // Redraw is triggered by the useEffect watching zoomPan state
    },
    [zoom, displayCanvasRef] // Use zoom from props
  );

  // Update cursor style based on tool and state
  useEffect(() => {
    if (!displayCanvasRef.current) return;
    const canvas = displayCanvasRef.current;
    switch (selectedTool) {
      case "fill":
        canvas.style.cursor = "url(/cursors/paint-bucket.svg) 8 16, crosshair";
        break;
      case "erase":
        canvas.style.cursor = "url(/cursors/eraser.svg) 8 8, crosshair";
        break;
      // Removed eyedropper case
      case "pan":
        canvas.style.cursor = isPanning ? "grabbing" : "grab"; // Use isPanning from props
        break;
      default:
        canvas.style.cursor = "default";
    }
  }, [selectedTool, isPanning, displayCanvasRef]); // Use isPanning from props

  return (
    <div
      ref={containerRef}
      className="flex-grow h-full w-full bg-gray-200 overflow-hidden relative flex items-center justify-center" // Ensure container prevents overflow
    >
      {isImageLoading && ( // Use isImageLoading from props
        <div className="absolute inset-0 bg-gray-400 bg-opacity-50 flex items-center justify-center z-20">
          <p className="text-white text-lg font-semibold">Loading Image...</p>
        </div>
      )}
      {!imageSrc && !isImageLoading && (
        <div className="text-gray-500 text-center p-10">
          <p>
            Select an image from the gallery or upload one to start coloring.
          </p>
        </div>
      )}
      {/* Hidden canvases for base image and color data */}
      {/* Refs are assigned in useCanvasCore, just ensure they exist */}
      <canvas ref={baseCanvasRef} className="hidden" />
      <canvas ref={colorCanvasRef} className="hidden" />

      {/* Visible canvas for interaction and display */}
      {imageSrc && (
        <canvas
          ref={displayCanvasRef} // Use ref from props
          className={`block max-w-full max-h-full ${
            isImageLoading ? "opacity-0" : "opacity-100" // Use isImageLoading from props
          } transition-opacity duration-300`} // Added transition
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave} // Important to stop dragging/panning
          onWheel={handleWheel}
          // Touch events would go here if needed
        />
      )}
    </div>
  );
};

export default CanvasArea;
//--------End File---------
