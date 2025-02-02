"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { quizApi, QuizQuestion, QuizResponse } from "@/services/quiz";

const NoQuestionsMessage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="space-y-6">
          {/* You can add an icon here */}
          <div className="text-gray-400 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-20 w-20 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-700">
            No Questions Available
          </h2>

          <p className="text-gray-500">
            We couldn't load any questions at the moment. This might be due to:
          </p>

          <ul className="text-gray-500 text-sm list-disc list-inside">
            <li>Connection issues</li>
            <li>Server maintenance</li>
            <li>Invalid quiz parameters</li>
          </ul>

          <Button onClick={() => window.location.reload()} className="mt-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Try Again
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default function MCQGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const router = useRouter();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const generateQuiz = async () => {
    if (!file) {
      alert("Please upload a document first!");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("user_id", "user_50");
      formData.append("num_questions", "5");

      console.log("Uploading file:", file.name);
      const response = await quizApi.generateQuizFromDocument(formData);

      if (!response.response?.questions) {
        throw new Error("No questions received from server");
      }

      console.log("Received questions:", response.response.questions);
      setQuestions(response.response.questions);
      setStarted(true);
    } catch (error: any) {
      console.error("Error generating quiz:", error);
      alert(`Error generating quiz: ${error.message}`);
      setStarted(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = async (answer: string) => {
    setSelectedAnswer(answer);
    const currentQ = questions[currentQuestionIndex];

    // Ensure question_number is a number and use it directly as the key
    const questionNumber = currentQ.question_number;

    // Update user answers (keys are converted to strings)
    const newUserAnswers: Record<string, string> = {
      ...userAnswers,
      [questionNumber]: answer, // Use questionNumber directly (no need to convert)
    };
    setUserAnswers(newUserAnswers);

    // Wait to show correct/incorrect answer
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // If this is the last question
    if (currentQuestionIndex === questions.length - 1) {
      try {
        const userId = "user_50";
        const stringifiedUserAnswers: Record<string, string> = {};
        for (const key in newUserAnswers) {
          stringifiedUserAnswers[key.toString()] = newUserAnswers[key];
        }

        const result = await quizApi.submitQuizAnswers(
          { response: { questions } },
          stringifiedUserAnswers, // Send the modified object
          userId,
        );

        // Navigate to results page
        router.push(
          `/mcq-results?result=${encodeURIComponent(JSON.stringify(result))}`,
        );
      } catch (error) {
        console.error("Error submitting quiz:", error);
        alert("Failed to submit quiz. Please try again.");
      }
    } else {
      // Move to next question
      setCurrentQuestionIndex((prev: number) => prev + 1);
      setSelectedAnswer(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Generating your quiz...</p>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <h2 className="text-2xl font-bold text-center mb-6">
            Upload Document for Quiz Generation
          </h2>
          <div className="space-y-6">
            <div className="flex flex-col items-center">
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".txt,.pdf,.doc,.docx"
                className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-violet-50 file:text-violet-700
                    hover:file:bg-violet-100"
              />
              <Button
                onClick={generateQuiz}
                className="mt-4"
                disabled={!file || loading}
              >
                Generate Quiz
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (started && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];

    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-sm text-gray-500">
                Score: {Object.keys(userAnswers).length}/{questions.length}
              </span>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold">{currentQuestion.question}</h3>

              <div className="space-y-2">
                {currentQuestion.options.map(
                  (option: string, index: number) => (
                    <Button
                      key={index}
                      onClick={() => handleAnswerSelect(option)}
                      className={`w-full justify-start text-left ${
                        selectedAnswer
                          ? option.trim().toLowerCase() ===
                            currentQuestion.answer.trim().toLowerCase()
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : option === selectedAnswer
                              ? "bg-red-500 hover:bg-red-600 text-white"
                              : "bg-white hover:bg-gray-100"
                          : "bg-white hover:bg-gray-100"
                      }`}
                      variant={
                        selectedAnswer === option ? "default" : "outline"
                      }
                      disabled={selectedAnswer !== null}
                    >
                      {option}
                    </Button>
                  ),
                )}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Button
                onClick={() =>
                  setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                }
                disabled={currentQuestionIndex === 0 || selectedAnswer !== null}
              >
                Previous
              </Button>
              <Button
                onClick={() =>
                  setCurrentQuestionIndex((prev) =>
                    Math.min(questions.length - 1, prev + 1),
                  )
                }
                disabled={
                  currentQuestionIndex === questions.length - 1 ||
                  selectedAnswer !== null
                }
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return <NoQuestionsMessage />;
}
