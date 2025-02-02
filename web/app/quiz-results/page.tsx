"use client";

import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function MCQResults() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const resultString = searchParams.get("result");
  const result = resultString ? JSON.parse(resultString) : null;

  if (!result) {
    return <div>No results available</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Quiz Results</h1>

        <div className="space-y-4">
          <div className="text-center text-4xl font-bold text-blue-600">
            {result.percentage.toFixed(1)}%
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-lg font-semibold">
                {result.correct_answers}
              </div>
              <div className="text-sm text-gray-500">Correct Answers</div>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-lg font-semibold">
                {result.total_questions}
              </div>
              <div className="text-sm text-gray-500">Total Questions</div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Question Details</h2>
            {result.details.map((detail: any, index: number) => (
              <div key={index} className="border-b py-4">
                <p className="font-medium">{detail.question}</p>
                <p
                  className={`mt-2 ${detail.is_correct ? "text-green-600" : "text-red-600"}`}
                >
                  Your answer: {detail.user_answer}
                </p>
                {!detail.is_correct && (
                  <p className="text-gray-600">
                    Correct answer: {detail.correct_answer}
                  </p>
                )}
              </div>
            ))}
          </div>

          <Button
            onClick={() => router.push("/mcq-generator")}
            className="w-full mt-6"
          >
            Take Another Quiz
          </Button>
        </div>
      </Card>
    </div>
  );
}
