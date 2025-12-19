import { Story, Sprint, TeamMember } from '../types';
import { calculateTeamCapacity } from './teamCapacity';

/**
 * Plans sprints by assigning stories based on team capacity
 * Uses a simple greedy algorithm to fit stories into sprints
 */
export function planSprints(
  stories: Story[],
  team: TeamMember[]
): Sprint[] {
  if (team.length === 0 || stories.length === 0) {
    return [];
  }

  const { weeklyCapacity } = calculateTeamCapacity(team);
  // Convert weekly capacity to story points (assuming 1 capacity unit ≈ 1 story point)
  // In a real system, this would be more sophisticated
  const sprintCapacity = Math.floor(weeklyCapacity);

  if (sprintCapacity <= 0) {
    return [];
  }

  const sprints: Sprint[] = [];
  const unassignedStories = [...stories].sort((a, b) => b.points - a.points); // Sort by points descending

  let sprintNumber = 1;

  while (unassignedStories.length > 0) {
    const sprintStories: Story[] = [];
    let remainingCapacity = sprintCapacity;

    // Greedily assign stories to this sprint
    for (let i = unassignedStories.length - 1; i >= 0; i--) {
      const story = unassignedStories[i];
      if (story.points <= remainingCapacity) {
        sprintStories.push({
          ...story,
          assignedSprint: sprintNumber,
        });
        remainingCapacity -= story.points;
        unassignedStories.splice(i, 1);
      }
    }

    if (sprintStories.length > 0) {
      const plannedPoints = sprintStories.reduce((sum, s) => sum + s.points, 0);
      sprints.push({
        id: sprintNumber,
        name: `Sprint ${sprintNumber}`,
        stories: sprintStories,
        plannedPoints,
        capacity: sprintCapacity,
      });
      sprintNumber++;
    } else {
      // If we can't fit any story, break to avoid infinite loop
      // This handles the case where a single story exceeds sprint capacity
      break;
    }
  }

  // If there are still unassigned stories, create an overflow sprint
  if (unassignedStories.length > 0) {
    const overflowStories = unassignedStories.map((story) => ({
      ...story,
      assignedSprint: sprintNumber,
    }));
    const plannedPoints = overflowStories.reduce((sum, s) => sum + s.points, 0);
    sprints.push({
      id: sprintNumber,
      name: `Sprint ${sprintNumber} (Overflow)`,
      stories: overflowStories,
      plannedPoints,
      capacity: sprintCapacity,
    });
  }

  return sprints;
}

