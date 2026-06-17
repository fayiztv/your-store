import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Shirt } from "lucide-react";

export default function ImageGallery({ images = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const galleryImages = Array.isArray(images) ? images.filter(Boolean) : [];

  if (galleryImages.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-gray-100">
        <Shirt className="h-20 w-20 text-gray-300" strokeWidth={1.2} />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={galleryImages[currentIndex]}
            alt={`Product view ${currentIndex + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full object-contain"
          />
        </AnimatePresence>
      </div>

      {galleryImages.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto hide-scrollbar">
          {galleryImages.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                currentIndex === index
                  ? "border-[var(--primary-dark)] ring-2 ring-primary/20"
                  : "border-gray-200 opacity-70 hover:border-gray-300 hover:opacity-100"
              }`}
            >
              <img
                src={src}
                alt={`Thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
