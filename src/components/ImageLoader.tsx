import React, { useRef, useCallback } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import IconButton from "./IconButton";

interface ImageLoaderProps {
  onImageSelect: (src: string) => void;
  predefinedImages: { name: string; src: string }[];
}

const ImageLoader: React.FC<ImageLoaderProps> = ({
  onImageSelect,
  predefinedImages,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            onImageSelect(e.target.result as string);
          }
        };
        reader.readAsDataURL(file);
        // Reset file input to allow selecting the same file again
        event.target.value = "";
      } else if (file) {
        alert("Please select a valid image file (PNG, JPG, etc.).");
      }
    },
    [onImageSelect]
  );

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="p-2 border rounded-lg bg-white shadow-sm space-y-2">
      <h3 className="text-sm font-medium text-gray-700 mb-1 px-1">
        Load Image
      </h3>
      <IconButton
        icon={Upload}
        label="Upload Image"
        onClick={triggerFileInput}
        className="w-full flex items-center justify-center text-sm space-x-1 py-1.5"
      >
        <span className="ml-1">Upload</span>
      </IconButton>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp, image/svg+xml" // Accept common image types
        className="hidden"
      />

      {predefinedImages.length > 0 && (
        <>
          <div className="border-t my-2"></div>
          <h4 className="text-xs font-medium text-gray-600 mb-1 px-1">
            Or select one:
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {predefinedImages.map((img) => (
              <button
                key={img.src}
                title={`Load ${img.name}`}
                aria-label={`Load ${img.name}`}
                onClick={() => onImageSelect(img.src)}
                className="aspect-square rounded border border-gray-200 overflow-hidden hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
              >
                <img
                  src={img.src}
                  alt={img.name}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageLoader;
