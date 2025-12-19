import { TeamMember, SkillArea } from '../types';

const skillMultiplier: Record<string, Record<string, number>> = {
  junior: { backend: 0.5, frontend: 0.5, fullstack: 0.6, qa: 0.5, devops: 0.4, mobile: 0.4 },
  mid: { backend: 0.8, frontend: 0.8, fullstack: 0.9, qa: 0.7, devops: 0.6, mobile: 0.6 },
  senior: { backend: 1.0, frontend: 1.0, fullstack: 1.1, qa: 0.9, devops: 0.8, mobile: 0.8 },
  lead: { backend: 1.2, frontend: 1.2, fullstack: 1.3, qa: 1.0, devops: 1.0, mobile: 1.0 },
};

export function calculateTeamCapacity(team: TeamMember[]): {
  dailyCapacity: number;
  weeklyCapacity: number;
  bySkill: Record<SkillArea, number>;
} {
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
        const multiplier = skillMultiplier[level]?.[area] || 0;
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

