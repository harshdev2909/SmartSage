"use client";
import { useState, useRef, useEffect } from "react"; // Add useEffect
import { Button } from "@/components/ui/button";
import { generateFlashcards } from "@/services/flashcard";
import { useRouter } from "next/navigation"; // Import useRouter
import FileInput from "./FileInput";

interface Flashcard {
  question: string;
  answer: string;
  topic: string;
}

export default function FlashcardGame() {
  const router = useRouter(); // Initialize router
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [knownCount, setKnownCount] = useState(0);
  const [unknownCount, setUnknownCount] = useState(0);
  const [isShowingAnswer, setIsShowingAnswer] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effect to handle completion
  useEffect(() => {
    if (isCompleted) {
      // Prepare results data
      const results = {
        total: flashcards.length,
        correct: knownCount,
        incorrect: unknownCount,
        percentage: ((knownCount / flashcards.length) * 100).toFixed(2),
      };

      // Redirect with results
      router.push(
        `/mcq-results?correct=${knownCount}&total=${flashcards.length}`,
      );
    }
  }, [isCompleted, knownCount, unknownCount, flashcards.length, router]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const generatedFlashcards = await generateFlashcards(file);
      if (generatedFlashcards.length === 0) {
        setError("No flashcards were generated. Please check your file.");
        return;
      }

      setFlashcards(generatedFlashcards);
      setCurrentCardIndex(0);
      setKnownCount(0);
      setUnknownCount(0);
      setIsCompleted(false); // Reset completion state
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate flashcards",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNextCard = (isKnown: boolean) => {
    if (isKnown) {
      setKnownCount((prev) => prev + 1);
    } else {
      setUnknownCount((prev) => prev + 1);
    }

    const nextIndex = currentCardIndex + 1;

    if (nextIndex >= flashcards.length) {
      // All cards completed
      setIsCompleted(true);
    } else {
      setCurrentCardIndex(nextIndex);
      setIsShowingAnswer(false);
    }
  };

  const currentCard = flashcards[currentCardIndex];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <FileInput onFileSelect={handleFileUpload} />
      </div>

      {/* Loading and Error States */}
      {loading && <div>Generating flashcards...</div>}
      {error && <div className="text-red-500">{error}</div>}

      {/* Flashcard Display */}
      {!loading && flashcards.length > 0 && currentCard && !isCompleted && (
        <>
          <div className="mb-4 text-lg font-medium text-muted-foreground">
            Card {currentCardIndex + 1} of {flashcards.length}
          </div>
          <div
            className="mb-8 cursor-pointer"
            onClick={() => setIsShowingAnswer(!isShowingAnswer)}
          >
            <div className="w-96 h-60 bg-white rounded-xl shadow-lg p-6">
              <div className="text-sm text-gray-500 mb-2">
                Topic: {currentCard.topic}
              </div>
              <div className="text-xl font-medium">
                {isShowingAnswer ? currentCard.answer : currentCard.question}
              </div>
              <div className="mt-4 text-gray-400 text-sm">
                Click to {isShowingAnswer ? "see question" : "see answer"}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-6 mt-4">
            <Button
              onClick={() => handleNextCard(false)}
              variant="outline"
              size="lg"
            >
              Don't Know ({unknownCount})
            </Button>
            <Button onClick={() => handleNextCard(true)} size="lg">
              Know ({knownCount})
            </Button>
          </div>
        </>
      )}

      {/* Optional: Show loading state while redirecting */}
      {isCompleted && (
        <div className="text-center">
          <div className="mb-4">Completing quiz...</div>
          <div>Redirecting to results...</div>
        </div>
      )}
    </div>
  );
}
