// File: app/page.tsx
"use client";

import React, { useState, useCallback, useEffect } from "react";
import Toolbar from "@/components/Toolbar";
import CanvasArea from "@/components/CanvasArea";
import { Tool } from "@/types";
import { useZoomPan } from "@/hooks/useZoomPan";
import { useCanvasCore } from "@/hooks/useCanvasCore";

const PREDEFINED_IMAGES = [
  { name: "Mandala 1", src: "/images/mandala1.png" },
  { name: "Floral 1", src: "/images/floral1.png" },
];

export default function HomePage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(
    PREDEFINED_IMAGES[0]?.src ?? null
  );
  const [selectedColor, setSelectedColor] = useState<string>("#FF0000");
  const [selectedTool, setSelectedTool] = useState<Tool>("fill");

  const {
    canvasRefs,
    imageSize,
    // Removed clearColoring from destructuring
    handleCanvasInteraction,
    redrawDisplayCanvas,
    isImageLoading,
  } = useCanvasCore(selectedImage, selectedColor, selectedTool);

  const {
    zoomPan,
    // setZoomPan, // Keep if needed elsewhere
    zoom,
    startPan,
    pan,
    endPan,
    resetZoomPan,
    fitToScreen,
    getTransformedPoint,
    isPanning,
  } = useZoomPan(
    { scale: 1, offset: { x: 0, y: 0 } },
    canvasRefs.displayCanvasRef,
    imageSize
  );

  // Effect to fit image when it loads or changes
  useEffect(() => {
    if (imageSize) {
      console.log(
        "HomePage: Image size changed, fitting to screen.",
        imageSize
      ); // Debug log
      fitToScreen();
    } else {
      console.log("HomePage: Image size is null, resetting zoom."); // Debug log
      resetZoomPan(); // Reset zoom if image unloaded
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSize]); // Trigger only when imageSize changes (fitToScreen/resetZoomPan are stable)

  // Removed handleClear function

  const zoomControlProps = {
    onZoomIn: () => zoom(-150),
    onZoomOut: () => zoom(150),
    onResetZoom: resetZoomPan,
    onFitToScreen: fitToScreen,
    canPan: zoomPan.scale > 1.05,
    onSelectTool: setSelectedTool,
    currentTool: selectedTool,
  };

  // Callback for ImageLoader
  const handleImageSelect = useCallback((src: string) => {
    console.log("HomePage: Image selected via Toolbar:", src); // Debug log
    setSelectedImage(src);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      {/* Toolbar */}
      <Toolbar
        selectedTool={selectedTool}
        onSelectTool={setSelectedTool}
        selectedColor={selectedColor}
        onColorChange={setSelectedColor}
        onImageSelect={handleImageSelect} // Pass the new handler
        predefinedImages={PREDEFINED_IMAGES}
        zoomControlProps={zoomControlProps}
        // Removed onClear prop
      />

      {/* Main Canvas Area */}
      <CanvasArea
        imageSrc={selectedImage}
        selectedColor={selectedColor}
        selectedTool={selectedTool}
        zoomPan={zoomPan}
        zoom={zoom}
        startPan={startPan}
        pan={pan}
        endPan={endPan}
        getTransformedPoint={getTransformedPoint}
        isPanning={isPanning}
        canvasRefs={canvasRefs}
        handleCanvasInteraction={handleCanvasInteraction}
        redrawDisplayCanvas={redrawDisplayCanvas}
        isImageLoading={isImageLoading}
      />
    </div>
  );
}
//--------End File---------
