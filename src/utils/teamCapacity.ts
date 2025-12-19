import { TeamMember, SkillArea, SkillLevel } from '../types';
import { loadSkillMultipliers } from './loadSkillMultipliers';

export function calculateTeamCapacity(team: TeamMember[]): {
  dailyCapacity: number;
  weeklyCapacity: number;
  bySkill: Record<SkillArea, number>;
} {
  // Load skill multipliers from CSV
  const skillMultipliers = loadSkillMultipliers();

  const bySkill: Record<SkillArea, number> = {
    backend: 0,
    frontend: 0,
    fullstack: 0,
    qa: 0,
    devops: 0,
    mobile: 0,
  };

  let totalDailyCapacity = 0;

  team.forEach((member) => {
    Object.entries(member.skills).forEach(([area, level]) => {
      if (level) {
        const multiplier = skillMultipliers[level as SkillLevel]?.[area as SkillArea] || 0;
        const contribution = multiplier * member.availability;
        bySkill[area as SkillArea] += contribution;
        totalDailyCapacity += contribution;
      }
    });
  });

  return {
    dailyCapacity: totalDailyCapacity,
    weeklyCapacity: totalDailyCapacity * 5, // 5 days per week
    bySkill,
  };
}




