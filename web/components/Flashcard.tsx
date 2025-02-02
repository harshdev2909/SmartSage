"use client";

interface FlashcardProps {
  question: string;
  answer: string;
  topic?: string;
}

export default function Flashcard({ question, answer, topic }: FlashcardProps) {
  console.log("Rendering Flashcard with:", { question, answer, topic }); // Debug log

  return (
    <div className="w-96 h-60 perspective-1000">
      <div className="relative w-full h-full cursor-pointer">
        <div className="absolute w-full h-full bg-white rounded-xl shadow-lg p-6">
          {topic && (
            <div className="text-sm text-gray-500 mb-2">Topic: {topic}</div>
          )}
          <div className="text-xl font-medium">
            Q: {question || "No question available"}
          </div>
          <div className="mt-4 text-gray-600">
            A: {answer || "No answer available"}
          </div>
        </div>
      </div>
    </div>
  );
}
