"use client"; // Client component for interactive elements

import Image from "next/image";
import { Download, Printer } from "lucide-react";

// Define the image type to match what's coming from the server
type ImageProps = {
  image: {
    src: string;
    alt?: string;
    name: string;
    key: string;
    category: string;
  };
};

export default function ImageContainer({ image }: ImageProps) {
  // Handle download button click
  const handleDownload = async () => {
    try {
      const response = await fetch(image.src, { mode: "cors" });
      if (!response.ok) throw new Error("Failed to fetch image");

      const blob = await response.blob();

      const urlParts = image.src.split(".");
      const extension =
        urlParts.length > 1 ? urlParts[urlParts.length - 1] : "jpg";
      const filename = `${image.name.replace(/\s+/g, "-")}.${extension}`;

      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please try again later.");
    }
  };

  // Handle print button click
  const handlePrint = () => {
    // Create a new window with just the image
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print this image");
      return;
    }

    // Add content to the print window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print: ${image.name}</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            img {
              max-width: 100%;
              max-height: 100vh;
              object-fit: contain;
            }
            @media print {
              body {
                height: 100%;
              }
              img {
                max-height: 100%;
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <img src="${image.src}" alt="${image.alt || image.name}" />
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div className="lg:w-2/3">
      <div className="apple-card overflow-hidden mb-6">
        <div className="w-full aspect-square lg:aspect-auto lg:h-96 relative">
          <Image
            src={image.src}
            alt={image.alt || image.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 66vw, 50vw"
            className="object-contain p-6"
            unoptimized={true}
          />
        </div>
      </div>

      {/* Action buttons with onClick handlers */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <button
          className="apple-button flex items-center justify-center flex-1"
          onClick={handleDownload}
        >
          <Download size={18} className="mr-2" /> Download
        </button>
        <button
          className="apple-secondary-button flex items-center justify-center flex-1"
          onClick={handlePrint}
        >
          <Printer size={18} className="mr-2" /> Print Now
        </button>
      </div>
    </div>
  );
}
