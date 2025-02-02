"use client";

import { useState } from "react";
import Slideshow from "@/components/Slideshow";
import { Sidebar } from "@/components/Sidebar";
import FileUpload from "./FileUpload";

interface Slide {
  title: string;
  content: string;
}

export default function CoursesPage() {
  const [slides, setSlides] = useState<Slide[]>([]);

  const handleDataReceived = (newSlides: Slide[]) => {
    setSlides(newSlides);
  };

  return (
    <div className="min-h-screen bg-white text-white">
      <main className="h-[calc(100vh-4rem)] flex">
        <div className="flex-1 flex flex-col">
          <FileUpload onDataReceived={handleDataReceived} />
          <div className="flex-1">
            <Slideshow slides={slides} />
          </div>
        </div>
      </main>
    </div>
  );
}
