// File: components/Toolbar.tsx
import React from "react";
// Removed Trash2 import
import { PaintBucket, Eraser } from "lucide-react";
import IconButton from "./IconButton";
import ColorPicker from "./ColorPicker";
import ImageLoader from "./ImageLoader";
import ZoomControls from "./ZoomControls";
import { Tool } from "@/types";

interface ToolbarProps {
  selectedTool: Tool;
  onSelectTool: (tool: Tool) => void;
  selectedColor: string;
  onColorChange: (color: string) => void;
  onImageSelect: (src: string) => void;
  predefinedImages: { name: string; src: string }[];
  zoomControlProps: React.ComponentProps<typeof ZoomControls>;
  // Removed onClear prop
}

const Toolbar: React.FC<ToolbarProps> = ({
  selectedTool,
  onSelectTool,
  selectedColor,
  onColorChange,
  onImageSelect,
  predefinedImages,
  zoomControlProps,
  // Removed onClear destructuring
}) => {
  return (
    <div className="w-64 h-full bg-gray-50 border-r border-gray-200 p-3 flex flex-col space-y-4 overflow-y-auto no-scrollbar">
      {/* Logo or Title */}
      <h1 className="text-xl font-semibold text-gray-800 tracking-tight">
        theColorBook<span className="text-blue-600">.fun</span>
      </h1>

      {/* Image Loading */}
      <ImageLoader
        onImageSelect={onImageSelect}
        predefinedImages={predefinedImages}
      />

      {/* Color Picker */}
      <ColorPicker
        selectedColor={selectedColor}
        onColorChange={onColorChange}
      />

      {/* Core Tools */}
      <div className="space-y-1 p-1 border rounded-lg bg-white shadow-sm">
        <h3 className="text-sm font-medium text-gray-700 mb-1 px-1">Tools</h3>
        <div className="flex space-x-1">
          <IconButton
            icon={PaintBucket}
            label="Fill Bucket"
            onClick={() => onSelectTool("fill")}
            isActive={selectedTool === "fill"}
          />
          <IconButton
            icon={Eraser}
            label="Eraser"
            onClick={() => onSelectTool("erase")}
            isActive={selectedTool === "erase"}
          />
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="space-y-1 p-1 border rounded-lg bg-white shadow-sm">
        <h3 className="text-sm font-medium text-gray-700 mb-1 px-1">View</h3>
        <ZoomControls
          {...zoomControlProps}
          onSelectTool={onSelectTool}
          currentTool={selectedTool}
        />
      </div>

      {/* Removed Actions Section (Clear button) */}

      {/* Footer/Info */}
      <div className="mt-auto pt-2 text-xs text-gray-500 text-center">
        Made with Next.js & Canvas
      </div>
    </div>
  );
};

export default Toolbar;
//--------End File---------
