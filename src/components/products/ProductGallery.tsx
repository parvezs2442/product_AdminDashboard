import React, { useState, useEffect } from 'react';
import { Package, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
  images?: string[];
  thumbnail?: string;
  title: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images = [],
  thumbnail,
  title,
}) => {
  // Combine thumbnail and images, removing duplicates
  const allImages = Array.from(new Set([thumbnail, ...images].filter(Boolean))) as string[];
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    setSelectedIndex(0);
    setHasError(false);
  }, [images, thumbnail]);

  const activeImage = allImages[selectedIndex] || thumbnail;

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
    setHasError(false);
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    setHasError(false);
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Primary Preview Frame */}
      <div className="relative w-full aspect-square sm:aspect-[4/3] rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center group shadow-xl">
        {activeImage && !hasError ? (
          <img
            key={activeImage}
            src={activeImage}
            alt={title}
            onError={() => setHasError(true)}
            className="w-full h-full object-contain p-4 transition-all duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500 space-y-2">
            <Package className="w-16 h-16 stroke-1 text-slate-600" />
            <span className="text-xs">No image preview available</span>
          </div>
        )}

        {/* Carousel Navigation Arrows if multiple images */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 shadow-lg"
              title="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 shadow-lg"
              title="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Counter pill */}
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 backdrop-blur-md text-[11px] font-mono text-slate-300">
              {selectedIndex + 1} / {allImages.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      {allImages.length > 1 && (
        <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
          {allImages.map((img, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={`${img}-${index}`}
                onClick={() => {
                  setSelectedIndex(index);
                  setHasError(false);
                }}
                className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-900 border overflow-hidden p-1 transition-all ${
                  isSelected
                    ? 'border-brand-500 ring-2 ring-brand-500/30 shadow-md shadow-brand-500/20'
                    : 'border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`${title} thumb ${index + 1}`}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
