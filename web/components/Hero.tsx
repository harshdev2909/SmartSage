import { Button } from "@/components/ui/button";
import VariableFontHoverByRandomLetter from "./text/variable-font-hover-by-random-letter";

export const Hero = () => {
  return (
    <section className="min-h-[80vh] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent pointer-events-none" />
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <span className="px-3 py-1 text-sm font-medium bg-primary rounded-full inline-block mb-4">
            AI-Powered Learning Assistant
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text">
            Your Personal AI Study Companion
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
            Transform your learning experience with AI-powered assistance that
            adapts to your unique study style and needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-black text-white rounded-full px-8 "
            >
              Get Started Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-8 border-2"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
