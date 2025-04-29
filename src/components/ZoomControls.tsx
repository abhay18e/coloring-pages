// File: components/ZoomControls.tsx
import React from "react";
import { ZoomIn, ZoomOut, RotateCcw, Expand, Hand } from "lucide-react";
import IconButton from "./IconButton";
import { Tool } from "@/types";

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitToScreen: () => void;
  // Keep pan tool props
  onSelectTool: (tool: Tool) => void;
  currentTool: Tool;
  canPan: boolean; // Only enable pan tool if zoomed in
}

const ZoomControls: React.FC<ZoomControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToScreen,
  onSelectTool,
  currentTool,
  canPan,
}) => {
  return (
    <div className="flex items-center space-x-1 bg-white p-1 rounded-lg shadow-sm border">
      <IconButton icon={ZoomIn} label="Zoom In" onClick={onZoomIn} />
      <IconButton icon={ZoomOut} label="Zoom Out" onClick={onZoomOut} />
      <IconButton
        icon={RotateCcw}
        label="Reset Zoom (1:1)"
        onClick={onResetZoom}
      />
      <IconButton icon={Expand} label="Fit to Screen" onClick={onFitToScreen} />
      <div className="border-l h-6 mx-1"></div> {/* Separator */}
      <IconButton
        icon={Hand}
        label="Pan Tool (Drag)"
        onClick={() => onSelectTool("pan")}
        isActive={currentTool === "pan"}
        disabled={!canPan} // Disable if not zoomed
        className={!canPan ? "text-gray-400 cursor-not-allowed" : ""}
      />
    </div>
  );
};

export default ZoomControls;
//--------End File---------
