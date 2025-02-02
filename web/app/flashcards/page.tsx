import FlashcardGame from "@/components/FlashcardGame";

export default function FlashcardsPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="mb-10 text-4xl font-bold">Flashcard Game</h1>
      <FlashcardGame />
    </div>
  );
}
