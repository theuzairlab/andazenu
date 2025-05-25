import { useState, useRef, useEffect } from 'react';

type ProductImageSliderProps = {
  mainImage: string;
  colorImages: Record<string, string>;
  selectedColor: string;
};

export default function ProductImageSlider({
  mainImage,
  colorImages,
  selectedColor,
}: ProductImageSliderProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Combine main image and color images into a single array
  const allImages = [mainImage, ...Object.values(colorImages || {})];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Mouse drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (sliderRef.current?.offsetLeft || 0));
    setScrollLeft(currentImageIndex);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (sliderRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    const newIndex = Math.round(scrollLeft - walk / (sliderRef.current?.offsetWidth || 1));
    
    if (newIndex >= 0 && newIndex < allImages.length) {
      setCurrentImageIndex(newIndex);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Auto sliding when not hovered
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isImageHovered && !isDragging) {
      interval = setInterval(() => {
        nextImage();
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isImageHovered, isDragging]);

  return (
    <div
      ref={sliderRef}
      className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
      onMouseEnter={() => setIsImageHovered(true)}
      onMouseLeave={() => {
        setIsImageHovered(false);
        setIsDragging(false);
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div
        className="w-full h-full transition-transform duration-300 ease-in-out"
        style={{
          transform: `translateX(-${currentImageIndex * 100}%)`,
        }}
      >
        <div className="absolute inset-0 flex">
          {allImages.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Product view ${index + 1}`}
              className="w-full h-full object-cover object-center flex-shrink-0"
              draggable="false"
            />
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          prevImage();
        }}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-white transition-colors"
        aria-label="Previous image"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          nextImage();
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-white transition-colors"
        aria-label="Next image"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Image indicators */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1">
        {allImages.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentImageIndex(index);
            }}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              currentImageIndex === index ? 'bg-black w-3' : 'bg-black/50'
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
} 