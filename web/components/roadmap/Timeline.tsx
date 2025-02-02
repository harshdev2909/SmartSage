import { Milestone } from "@/types/roadmap";

interface TimelineProps {
  milestones: Milestone[];
}

export const Timeline: React.FC<TimelineProps> = ({ milestones }) => {
  if (!Array.isArray(milestones) || milestones.length === 0) {
    return (
      <div className="text-center text-gray-500">No roadmap available</div>
    );
  }

  return (
    <div className="relative">
      {milestones.map((milestone, index) => (
        <div key={index} className="mb-8 flex items-start">
          <div className="flex flex-col items-center mr-4">
            <div className="w-4 h-4 bg-blue-500 rounded-full" />
            {index < milestones.length - 1 && (
              <div className="w-0.5 h-full bg-blue-300" />
            )}
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md flex-1">
            <h3 className="font-bold">{milestone.title || "Untitled Step"}</h3>
            <p className="text-gray-600">
              {milestone.description || "No description available"}
            </p>
            {milestone.duration && (
              <p className="text-sm text-gray-500 mt-2">
                Duration: {milestone.duration}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
