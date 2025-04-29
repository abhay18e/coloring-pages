// File: hooks/useZoomPan.ts
import { useState, useCallback, useRef, useEffect } from "react"; // Added useEffect
import { ZoomPanState, Point } from "@/types";

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 10.0;
const ZOOM_SENSITIVITY = 0.002;

export function useZoomPan(
  initialState: ZoomPanState = { scale: 1, offset: { x: 0, y: 0 } },
  canvasRef: React.RefObject<HTMLCanvasElement>,
  imageSize: { width: number; height: number } | null
) {
  const [zoomPan, setZoomPan] = useState<ZoomPanState>(initialState);
  const isPanningRef = useRef(false);
  const lastMousePosRef = useRef<Point | null>(null);

  // Reset zoom/pan when the image size becomes null (image unloaded)
  useEffect(() => {
    if (!imageSize) {
      // console.log("Image size is null, resetting zoom/pan."); // Debug log
      setZoomPan(initialState);
    }
    // Also reset if canvasRef becomes null, although less likely
    if (!canvasRef.current) {
      setZoomPan(initialState);
    }
  }, [imageSize, canvasRef, initialState]);

  // Apply transform (used by redraw) - No changes needed
  const applyZoomPan = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.translate(zoomPan.offset.x, zoomPan.offset.y);
      ctx.scale(zoomPan.scale, zoomPan.scale);
    },
    [zoomPan]
  );

  // Zoom logic - No changes needed
  const zoom = useCallback(
    (deltaY: number, mousePos?: Point) => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;

      setZoomPan((prev) => {
        const newScale = Math.max(
          MIN_ZOOM,
          Math.min(
            MAX_ZOOM,
            prev.scale - deltaY * ZOOM_SENSITIVITY * prev.scale
          )
        );

        // Prevent zooming out further if already smaller than initial fit
        // This check might be too simple, consider comparing to calculated fit scale
        // if (newScale < initialState.scale && deltaY > 0) {
        //   // Optionally prevent zooming out beyond initial state
        // }

        let newOffsetX = prev.offset.x;
        let newOffsetY = prev.offset.y;

        if (mousePos) {
          const mouseX = mousePos.x;
          const mouseY = mousePos.y;
          const contentMouseX = (mouseX - prev.offset.x) / prev.scale;
          const contentMouseY = (mouseY - prev.offset.y) / prev.scale;
          newOffsetX = mouseX - contentMouseX * newScale;
          newOffsetY = mouseY - contentMouseY * newScale;
        } else {
          const centerX = canvas.clientWidth / 2; // Use clientWidth for visible center
          const centerY = canvas.clientHeight / 2;
          const contentCenterX = (centerX - prev.offset.x) / prev.scale;
          const contentCenterY = (centerY - prev.offset.y) / prev.scale;
          newOffsetX = centerX - contentCenterX * newScale;
          newOffsetY = centerY - contentCenterY * newScale;
        }

        return { scale: newScale, offset: { x: newOffsetX, y: newOffsetY } };
      });
    },
    [canvasRef] // Removed initialState dependency
  );

  // Start Pan - No changes needed
  const startPan = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      isPanningRef.current = true;
      lastMousePosRef.current = { x: event.clientX, y: event.clientY };
      if (canvasRef.current) {
        canvasRef.current.style.cursor = "grabbing";
      }
    },
    [canvasRef]
  );

  // Pan - No changes needed
  const pan = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (
        !isPanningRef.current ||
        !lastMousePosRef.current ||
        !canvasRef.current
      )
        return;

      const currentMousePos = { x: event.clientX, y: event.clientY };
      const deltaX = currentMousePos.x - lastMousePosRef.current.x;
      const deltaY = currentMousePos.y - lastMousePosRef.current.y;

      setZoomPan((prev) => ({
        ...prev,
        offset: {
          x: prev.offset.x + deltaX,
          y: prev.offset.y + deltaY,
        },
      }));

      lastMousePosRef.current = currentMousePos;
    },
    [canvasRef]
  ); // Added canvasRef dependency

  // End Pan - No changes needed
  const endPan = useCallback(() => {
    isPanningRef.current = false;
    lastMousePosRef.current = null;
    if (canvasRef.current) {
      // Cursor style is handled in CanvasArea effect based on tool and isPanning state
      // canvasRef.current.style.cursor = "grab"; // Remove direct cursor change here
    }
  }, [canvasRef]);

  // Reset Zoom - Reset to initial state (1:1, centered)
  const resetZoomPan = useCallback(() => {
    if (!canvasRef.current || !imageSize?.width || !imageSize?.height) {
      setZoomPan({ scale: 1, offset: { x: 0, y: 0 } }); // Fallback reset
      return;
    }
    const canvas = canvasRef.current;
    const containerWidth = canvas.clientWidth; // Use clientWidth
    const containerHeight = canvas.clientHeight; // Use clientHeight

    // Center the 1:1 image
    const newScale = 1.0;
    const newOffsetX = (containerWidth - imageSize.width * newScale) / 2;
    const newOffsetY = (containerHeight - imageSize.height * newScale) / 2;

    setZoomPan({ scale: newScale, offset: { x: newOffsetX, y: newOffsetY } });
  }, [canvasRef, imageSize]); // Added dependencies

  // Fit To Screen - No changes needed
  const fitToScreen = useCallback(() => {
    if (!canvasRef.current || !imageSize?.width || !imageSize?.height) return;
    const canvas = canvasRef.current;
    // Use clientWidth/clientHeight for accurate visible area calculation
    const containerWidth = canvas.clientWidth;
    const containerHeight = canvas.clientHeight;

    // Calculate scale needed to fit width and height
    const scaleX = containerWidth / imageSize.width;
    const scaleY = containerHeight / imageSize.height;
    // Choose the smaller scale to fit entirely, add padding
    const newScale = Math.max(
      MIN_ZOOM,
      Math.min(MAX_ZOOM, Math.min(scaleX, scaleY) * 0.95)
    );

    // Center the image within the container
    const newOffsetX = (containerWidth - imageSize.width * newScale) / 2;
    const newOffsetY = (containerHeight - imageSize.height * newScale) / 2;

    setZoomPan({ scale: newScale, offset: { x: newOffsetX, y: newOffsetY } });
  }, [canvasRef, imageSize]);

  // Get Transformed Point - Added debug logs
  const getTransformedPoint = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>): Point | null => {
      if (!canvasRef.current) return null;
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();

      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const imageX = (mouseX - zoomPan.offset.x) / zoomPan.scale;
      const imageY = (mouseY - zoomPan.offset.y) / zoomPan.scale;

      // console.log( // Debug log
      //   `Mouse: (${event.clientX}, ${event.clientY}), ` +
      //   `CanvasRel: (${mouseX.toFixed(2)}, ${mouseY.toFixed(2)}), ` +
      //   `ZoomPan: (S: ${zoomPan.scale.toFixed(2)}, O: ${zoomPan.offset.x.toFixed(2)}, ${zoomPan.offset.y.toFixed(2)}), ` +
      //   `ImageCoords: (${imageX.toFixed(2)}, ${imageY.toFixed(2)}) -> (${Math.floor(imageX)}, ${Math.floor(imageY)})`
      // );

      // Clamp coordinates to image bounds to prevent errors in flood fill etc.
      const clampedX = Math.max(
        0,
        Math.min(Math.floor(imageX), imageSize?.width ? imageSize.width - 1 : 0)
      );
      const clampedY = Math.max(
        0,
        Math.min(
          Math.floor(imageY),
          imageSize?.height ? imageSize.height - 1 : 0
        )
      );

      // Return null if imageSize isn't available (though clamping handles 0 case)
      if (!imageSize) return null;

      return { x: clampedX, y: clampedY };
    },
    [zoomPan, canvasRef, imageSize] // Added imageSize dependency
  );

  return {
    zoomPan,
    setZoomPan,
    applyZoomPan,
    zoom,
    startPan,
    pan,
    endPan,
    resetZoomPan,
    fitToScreen,
    isPanning: isPanningRef.current, // Expose the current state
    getTransformedPoint,
  };
}
