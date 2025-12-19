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

export interface Sprint {
  id: number;
  name: string;
  stories: Story[];
  plannedPoints: number;
  capacity: number;
}

export interface SimulationState {
  currentScreen: 'team' | 'epic' | 'planning' | 'sprint';
  team: TeamMember[];
  epic: Epic | null;
  sprints: Sprint[];
}

export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';

export type AvailabilityStatus = 'available' | 'on-call' | 'sick' | 'support' | 'context-switched';

export interface DailyDisruption {
  memberId: string;
  onCallPercent: number; // 0-1
  sickPercent: number; // 0-1
  supportWork: boolean;
  contextSwitched: boolean;
}

export interface DailyState {
  day: DayOfWeek;
  dayNumber: number; // 1-5
  disruptions: DailyDisruption[];
  completedPoints: number;
  inProgressPoints: number;
  remainingPoints: number;
  velocity: number;
  confidence: number; // 0-100
  aiLog: string[];
}

export interface SprintMetrics {
  plannedPoints: number;
  remainingPoints: number;
  completedPoints: number;
  inProgressPoints: number;
  eta: number; // days remaining
  confidence: number; // 0-100
  velocity: number;
  spilloverRisk: number; // 0-100
}




