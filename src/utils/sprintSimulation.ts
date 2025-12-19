import { TeamMember, Story, DailyDisruption, DailyState, SprintMetrics, DayOfWeek } from '../types';
import { calculateTeamCapacity } from './teamCapacity';

const DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

/**
 * Calculate effective team capacity for a day considering disruptions
 */
export function calculateEffectiveCapacity(
  team: TeamMember[],
  disruptions: DailyDisruption[]
): number {
  const disruptionMap = new Map(disruptions.map((d) => [d.memberId, d]));
  
  let totalCapacity = 0;
  for (const member of team) {
    const disruption = disruptionMap.get(member.id);
    if (!disruption) {
      totalCapacity += member.availability;
      continue;
    }

    // Calculate effective availability after disruptions
    let effectiveAvailability = member.availability;
    
    // Reduce by on-call percentage
    effectiveAvailability *= (1 - disruption.onCallPercent);
    
    // Reduce by sick percentage
    effectiveAvailability *= (1 - disruption.sickPercent);
    
    // If doing support work, reduce by 50%
    if (disruption.supportWork) {
      effectiveAvailability *= 0.5;
    }
    
    // If context-switched, reduce by 30%
    if (disruption.contextSwitched) {
      effectiveAvailability *= 0.7;
    }
    
    totalCapacity += effectiveAvailability;
  }
  
  return totalCapacity;
}

/**
 * Simulate story progress for a day
 */
export function simulateDayProgress(
  stories: Story[],
  team: TeamMember[],
  disruptions: DailyDisruption[],
  currentDay: number
): {
  completed: Story[];
  inProgress: Story[];
  remaining: Story[];
} {
  const effectiveCapacity = calculateEffectiveCapacity(team, disruptions);
  // Assume 1 capacity unit ≈ 1 story point per day
  const dailyVelocity = effectiveCapacity;
  
  const completed: Story[] = [];
  const inProgress: Story[] = [];
  const remaining: Story[] = [];
  
  let pointsCompleted = 0;
  
  for (const story of stories) {
    if (story.status === 'completed') {
      completed.push(story);
      pointsCompleted += story.points;
    } else if (story.status === 'in-progress') {
      // Complete in-progress stories if we have capacity
      if (pointsCompleted + story.points <= dailyVelocity) {
        completed.push({ ...story, status: 'completed' });
        pointsCompleted += story.points;
      } else {
        inProgress.push(story);
      }
    } else {
      // Start new stories if we have capacity
      if (pointsCompleted < dailyVelocity) {
        const remainingCapacity = dailyVelocity - pointsCompleted;
        if (story.points <= remainingCapacity) {
          completed.push({ ...story, status: 'completed' });
          pointsCompleted += story.points;
        } else if (remainingCapacity > 0) {
          inProgress.push({ ...story, status: 'in-progress' });
        } else {
          remaining.push(story);
        }
      } else {
        remaining.push(story);
      }
    }
  }
  
  return { completed, inProgress, remaining };
}

/**
 * Generate AI re-planning log messages
 */
export function generateAILog(
  team: TeamMember[],
  disruptions: DailyDisruption[],
  previousVelocity: number,
  currentVelocity: number,
  spilloverRisk: number
): string[] {
  const logs: string[] = [];
  
  // Check for disruptions
  const hasDisruptions = disruptions.some(
    (d) => d.onCallPercent > 0 || d.sickPercent > 0 || d.supportWork || d.contextSwitched
  );
  
  if (hasDisruptions) {
    const disruptionDetails: string[] = [];
    
    for (const disruption of disruptions) {
      const member = team.find((m) => m.id === disruption.memberId);
      if (!member) continue;
      
      if (disruption.sickPercent > 0) {
        disruptionDetails.push(`${member.name} unavailable (${Math.round(disruption.sickPercent * 100)}%)`);
      }
      if (disruption.onCallPercent > 0) {
        disruptionDetails.push(`${member.name} on-call (${Math.round(disruption.onCallPercent * 100)}%)`);
      }
      if (disruption.supportWork) {
        disruptionDetails.push(`${member.name} handling support work`);
      }
      if (disruption.contextSwitched) {
        disruptionDetails.push(`${member.name} context-switched`);
      }
    }
    
    if (disruptionDetails.length > 0) {
      logs.push(`Team capacity reduced: ${disruptionDetails.join(', ')}`);
    }
  }
  
  // Velocity change
  if (currentVelocity !== previousVelocity) {
    const change = currentVelocity - previousVelocity;
    const direction = change > 0 ? 'increased' : 'decreased';
    logs.push(`Velocity ${direction} from ${previousVelocity.toFixed(1)} → ${currentVelocity.toFixed(1)} pts/day`);
  }
  
  // Spillover risk
  if (spilloverRisk > 50) {
    logs.push(`High spillover risk detected (${Math.round(spilloverRisk)}%)`);
  } else if (spilloverRisk > 25) {
    logs.push(`Moderate spillover risk (${Math.round(spilloverRisk)}%)`);
  }
  
  // Default message if no specific issues
  if (logs.length === 0) {
    logs.push('Sprint progressing as planned');
  }
  
  return logs;
}

/**
 * Calculate sprint metrics for a given day
 */
export function calculateSprintMetrics(
  plannedPoints: number,
  completedPoints: number,
  inProgressPoints: number,
  remainingPoints: number,
  currentDay: number,
  totalDays: number,
  velocity: number
): SprintMetrics {
  const daysRemaining = totalDays - currentDay;
  const eta = velocity > 0 ? Math.ceil(remainingPoints / velocity) : daysRemaining;
  
  // Calculate confidence based on progress and velocity
  const progressPercent = (completedPoints / plannedPoints) * 100;
  const expectedProgress = (currentDay / totalDays) * 100;
  const progressDelta = progressPercent - expectedProgress;
  
  let confidence = 100;
  if (progressDelta < -20) {
    confidence = 40; // Significantly behind
  } else if (progressDelta < -10) {
    confidence = 60; // Slightly behind
  } else if (progressDelta > 20) {
    confidence = 95; // Ahead of schedule
  } else if (progressDelta > 10) {
    confidence = 85; // Slightly ahead
  } else {
    confidence = 75; // On track
  }
  
  // Adjust confidence based on velocity
  if (velocity < plannedPoints / totalDays * 0.8) {
    confidence = Math.max(30, confidence - 20);
  }
  
  // Calculate spillover risk
  const spilloverRisk = velocity > 0 && daysRemaining > 0
    ? Math.min(100, Math.max(0, ((remainingPoints / velocity) - daysRemaining) / daysRemaining * 100))
    : remainingPoints > 0 ? 100 : 0;
  
  return {
    plannedPoints,
    remainingPoints,
    completedPoints,
    inProgressPoints,
    eta,
    confidence,
    velocity,
    spilloverRisk,
  };
}

/**
 * Get day of week by number (1-5)
 */
export function getDayOfWeek(dayNumber: number): DayOfWeek {
  return DAYS[dayNumber - 1] || 'Mon';
}
