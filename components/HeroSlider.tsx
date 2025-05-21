'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import useSiteSettings from '@/app/stores/useSiteSettings';

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { settings } = useSiteSettings();
  // Fallback slides if no settings images are found
  const fallbackSlides = [
    {
      id: 1,
      image: '/images/slider/slider1.jpeg',
      title: 'WEAR YOUR POWER',
      subtitle: 'Express your style with authentic designs',
    },
    {
      id: 2,
      image: '/images/slider/slider2.jpeg',
      title: 'STYLE YOUR LIFE',
      subtitle: 'Discover our premium collection of apparel',
    },
  ];

  // Dynamically map images from settings
  const slides = settings?.heroSliderImages?.length
    ? settings.heroSliderImages.map((imageUrl: string, index: number) => ({
        id: index + 1,
        image: imageUrl,
        title: 'YOUR CUSTOM STYLE',
        subtitle: 'Personalized by you',
      }))
    : fallbackSlides;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="relative h-[530px] md:h-[680px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="relative w-full h-full">
            <img src={slide.image} alt={slide.title} className="object-cover h-full w-full" />
          </div>
        </div>
      ))}

      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              index === currentSlide
                ? 'bg-gray-700 ring-1 ring-offset-4 ring-black scale-90'
                : 'bg-gray-700 bg-opacity-90'
            }`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>
    </div>
  );
}
