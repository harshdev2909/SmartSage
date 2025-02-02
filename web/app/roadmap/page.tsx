"use client";
import { Timeline } from "@/components/roadmap/Timeline";
import { useState } from "react";

export default function RoadmapPage() {
  interface Milestone {
    title: string;
    description: string;
    duration?: string;
  }

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/portfolio/roadmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: "user123",
          prompt: prompt.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      console.log("Response from backend:", data);

      if (data.error) {
        throw new Error(data.error);
      }

      const roadmapData = data.roadmap || [];
      if (!Array.isArray(roadmapData) || roadmapData.length === 0) {
        throw new Error(
          "No roadmap data generated. Please refine your prompt.",
        );
      }

      setMilestones(roadmapData as Milestone[]);
    } catch (error: unknown) {
      console.error("Error generating roadmap:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to generate roadmap. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
      <h1 className="text-3xl font-bold mb-8 text-center">Roadmap Generator</h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-col space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your learning goals..."
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className={`px-4 py-2 rounded-md text-white ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Generating..." : "Generate Roadmap"}
          </button>
        </div>
      </form>

      {milestones.length > 0 && <Timeline milestones={milestones} />}
    </div>
  );
}
