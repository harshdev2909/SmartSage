"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface Slide {
  title: string;
  content: string;
}

interface SlideshowProps {
  slides: Slide[];
}

export default function Slideshow({ slides }: SlideshowProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // If no slides are provided, show a message
  if (!slides || slides.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        Upload a file to generate slides
      </div>
    );
  }

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const endSlideshow = () => {
    setCurrentSlide(0);
  };

  return (
    <div className="flex h-full bg-black text-white">
      {/* Sidebar with all slides */}
      <div className="w-1/4 overflow-y-auto border-r border-gray-800">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={cn(
              "p-4 cursor-pointer hover:bg-gray-900 transition-colors",
              index === currentSlide && "bg-gray-800",
            )}
            onClick={() => setCurrentSlide(index)}
          >
            <h3 className="text-sm font-medium text-gray-300 truncate">
              {slide.title}
            </h3>
          </div>
        ))}
      </div>

      {/* Main content area */}
      <div className="w-3/4 flex flex-col">
        <div className="flex-grow overflow-y-auto p-8 bg-gradient-to-br from-gray-900 to-black">
          <h2 className="text-3xl font-bold mb-6 text-blue-400">
            {slides[currentSlide].title}
          </h2>
          <div className="text-lg text-gray-300 whitespace-pre-wrap leading-relaxed">
            {slides[currentSlide].content}
          </div>
        </div>

        {/* Navigation controls */}
        <div className="p-4 bg-gray-900 border-t border-gray-800 flex justify-between items-center">
          <div className="text-sm text-gray-400">
            Slide {currentSlide + 1} of {slides.length}
          </div>
          <div className="flex space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevSlide}
              className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextSlide}
              className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={endSlideshow}
              className="bg-gray-700 text-white hover:bg-gray-600"
            >
              <Home className="h-4 w-4 mr-2" />
              End Slideshow
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
