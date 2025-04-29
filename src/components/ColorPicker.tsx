import React from "react";
import { Palette } from "lucide-react";

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

const PRESET_COLORS = [
  "#FF0000",
  "#FF7F00",
  "#FFFF00",
  "#00FF00",
  "#0000FF",
  "#4B0082",
  "#9400D3",
  "#FFFFFF",
  "#CCCCCC",
  "#888888",
  "#444444",
  "#000000",
  "#FFC0CB",
  "#A52A2A",
  "#ADD8E6",
  "#90EE90",
  "#F5DEB3",
  "#FFA500",
];

const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onColorChange,
}) => {
  return (
    <div className="flex flex-col items-start space-y-2 p-2 border rounded-lg bg-white shadow-sm">
      <label
        htmlFor="color-input"
        className="flex items-center space-x-2 cursor-pointer group"
      >
        <Palette
          size={20}
          className="text-gray-600 group-hover:text-blue-600"
        />
        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
          Custom Color
        </span>
        <input
          id="color-input"
          type="color"
          value={selectedColor}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-8 h-8 border-none cursor-pointer rounded overflow-hidden appearance-none bg-transparent p-0"
          style={{ backgroundColor: selectedColor }} // Show selected color visually
        />
      </label>

      <div className="grid grid-cols-7 gap-1 pt-2 border-t w-full">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            title={color}
            aria-label={`Select color ${color}`}
            onClick={() => onColorChange(color)}
            className={`w-6 h-6 rounded border border-gray-300 transition-transform duration-100 ease-in-out hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400 ${
              selectedColor.toUpperCase() === color.toUpperCase()
                ? "ring-2 ring-offset-1 ring-blue-500 scale-110"
                : ""
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;
