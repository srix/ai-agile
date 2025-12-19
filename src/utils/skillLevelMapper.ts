import { SkillLevel } from '../types';

/**
 * Maps percentage (0-100) to skill level
 */
export function percentageToSkillLevel(percentage: number): SkillLevel | null {
  if (percentage === 0) return null;
  if (percentage <= 30) return 'junior';
  if (percentage <= 60) return 'mid';
  if (percentage <= 85) return 'senior';
  return 'lead';
}

/**
 * Maps skill level to percentage range (returns midpoint)
 */
export function skillLevelToPercentage(level: SkillLevel | null): number {
  if (!level) return 0;
  switch (level) {
    case 'junior':
      return 20; // 0-30 range, midpoint ~20
    case 'mid':
      return 50; // 30-60 range, midpoint ~50
    case 'senior':
      return 75; // 60-85 range, midpoint ~75
    case 'lead':
      return 95; // 85-100 range, midpoint ~95
    default:
      return 0;
  }
}

/**
 * Gets skill level label with percentage
 */
export function getSkillLevelLabel(percentage: number): string {
  if (percentage === 0) return 'None (0%)';
  if (percentage <= 20) return `Novice (${percentage}%)`;
  if (percentage <= 35) return `Junior (${percentage}%)`;
  if (percentage <= 60) return `Mid-Level (${percentage}%)`;
  if (percentage <= 85) return `Senior (${percentage}%)`;
  return `Lead (${percentage}%)`;
}

