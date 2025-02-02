export interface Milestone {
  title: string;
  description: string;
  duration?: string;
  status?: string;
}

export interface RoadmapResponse {
  roadmap: Milestone[];
  error?: string;
}
