import Papa from 'papaparse';
import skillMultipliersCsv from '../data/skillMultipliers.csv?raw';
import { SkillLevel, SkillArea } from '../types';

export type SkillMultipliers = Record<SkillLevel, Record<SkillArea, number>>;

let cachedMultipliers: SkillMultipliers | null = null;

export function loadSkillMultipliers(): SkillMultipliers {
  if (cachedMultipliers) {
    return cachedMultipliers;
  }

  const result = Papa.parse(skillMultipliersCsv, {
    header: true,
    skipEmptyLines: true,
  });

  const multipliers: Partial<SkillMultipliers> = {};

  result.data.forEach((row: any) => {
    const level = row.skill_level as SkillLevel;
    if (!level) return;

    multipliers[level] = {
      backend: parseFloat(row.backend) || 0,
      frontend: parseFloat(row.frontend) || 0,
      fullstack: parseFloat(row.fullstack) || 0,
      qa: parseFloat(row.qa) || 0,
      devops: parseFloat(row.devops) || 0,
      mobile: parseFloat(row.mobile) || 0,
    } as Record<SkillArea, number>;
  });

  // Ensure all levels are present
  const allLevels: SkillLevel[] = ['junior', 'mid', 'senior', 'lead'];
  const allAreas: SkillArea[] = ['backend', 'frontend', 'fullstack', 'qa', 'devops', 'mobile'];
  
  const completeMultipliers: SkillMultipliers = {} as SkillMultipliers;
  
  allLevels.forEach((level) => {
    completeMultipliers[level] = {} as Record<SkillArea, number>;
    allAreas.forEach((area) => {
      completeMultipliers[level][area] = multipliers[level]?.[area] || 0;
    });
  });

  cachedMultipliers = completeMultipliers;
  return cachedMultipliers;
}

