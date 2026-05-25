import { X, ZoomIn, ZoomOut, Download } from "lucide-react";
import { useState } from "react";

const ImageLightbox = ({ src, onClose }) => {
  const [scale, setScale] = useState(1);

  const zoomIn = (e) => {
    e.stopPropagation();
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const zoomOut = (e) => {
    e.stopPropagation();
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const downloadImage = (e) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = src;
    link.download = `chat_image_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md animate-fade-in p-4"
      onClick={onClose}
    >
      {/* Header controls */}
      <div className="absolute top-4 right-4 flex items-center gap-3 z-55">
        <button
          onClick={downloadImage}
          className="p-2.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-white transition-all transform hover:scale-105 shadow-lg cursor-pointer"
          title="Download Image"
        >
          <Download size={20} />
        </button>
        <button
          onClick={zoomIn}
          className="p-2.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-white transition-all transform hover:scale-105 shadow-lg cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn size={20} />
        </button>
        <button
          onClick={zoomOut}
          className="p-2.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-white transition-all transform hover:scale-105 shadow-lg cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut size={20} />
        </button>
        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-red-600/90 hover:bg-red-700 text-white transition-all transform hover:scale-105 shadow-lg cursor-pointer ml-2"
          title="Close Preview"
        >
          <X size={20} />
        </button>
      </div>

      {/* Image container */}
      <div className="relative max-w-full max-h-[85vh] overflow-hidden flex items-center justify-center select-none">
        <img
          src={src}
          alt="High Resolution Preview"
          style={{ transform: `scale(${scale})` }}
          className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg shadow-2xl transition-transform duration-200 ease-out cursor-default"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Instructions */}
      <p className="absolute bottom-4 text-xs text-zinc-500 pointer-events-none select-none">
        Click anywhere outside the image to dismiss
      </p>
    </div>
  );
};

export default ImageLightbox;
