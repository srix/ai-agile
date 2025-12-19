export type SkillLevel = 'junior' | 'mid' | 'senior' | 'lead';

export type SkillArea = 'backend' | 'frontend' | 'fullstack' | 'qa' | 'devops' | 'mobile';

export interface TeamMember {
  id: string;
  name: string;
  skills: Record<SkillArea, SkillLevel | null>;
  availability: number; // 0-1, percentage of time available
}

export interface Story {
  id: string;
  title: string;
  description: string;
  points: number;
  assignedSprint?: number;
  status: 'planned' | 'in-progress' | 'completed';
}

export interface Epic {
  id: string;
  title: string;
  description: string;
  stories: Story[];
  totalPoints: number;
}

export interface SimulationState {
  currentScreen: 'team' | 'epic' | 'sprint';
  team: TeamMember[];
  epic: Epic | null;
}

