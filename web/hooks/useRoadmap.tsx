import { useState } from "react";
import { Milestone, RoadmapResponse } from "../types/roadmap";

export function useRoadmap() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRoadmap = async (prompt: string, userId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/portfolio/roadmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          prompt,
        }),
      });

      const data: RoadmapResponse = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setMilestones(data.roadmap);
      }
    } catch (error) {
      setError("Failed to generate roadmap");
    } finally {
      setLoading(false);
    }
  };

  return {
    milestones,
    loading,
    error,
    generateRoadmap,
  };
}
