import { useRef, useEffect, useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { SkillArea } from '../types';

interface InteractiveRadarChartProps {
  data: Array<{ skill: string; value: number; fullMark: number }>;
  skillAreas: SkillArea[];
  skillPercentages: Record<SkillArea, number>;
  onSkillChange: (area: SkillArea, value: number) => void;
}

export default function InteractiveRadarChart({
  data,
  skillAreas,
  skillPercentages,
  onSkillChange,
}: InteractiveRadarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setChartSize({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const clickX = e.clientX - centerX;
      const clickY = e.clientY - centerY;
      
      // Calculate angle and distance
      // Math.atan2(y, x): 0° = right, 90° = bottom, -90° = top, 180° = left
      // In screen coordinates: y increases downward
      const angle = Math.atan2(clickY, clickX) * (180 / Math.PI);
      const distance = Math.sqrt(clickX * clickX + clickY * clickY);
      const maxDistance = Math.min(rect.width, rect.height) / 2 - 40; // Account for padding
      
      if (distance > maxDistance) return; // Clicked outside the chart area
      
      // Recharts radar chart: first data point (BACKEND) is at top (12 o'clock)
      // Math.atan2(clickY, clickX): -90° = top, 0° = right, 90° = bottom, 180° = left
      // Convert to 0-360 range where 0° = top (BACKEND), clockwise
      // Top is -90°, so add 90 to make it 0°, then add 360 and mod to ensure positive
      let adjustedAngle = (angle + 90 + 360) % 360;
      
      // Recharts positions axes starting from top, going clockwise
      // But we need to account for the actual positioning
      // Try adding 180 degrees offset to fix the opposite axis issue
      adjustedAngle = (adjustedAngle + 180) % 360;
      
      // Each skill is 60 degrees apart (360 / 6 = 60)
      // BACKEND (index 0) is at top (0°)
      // FRONTEND (index 1) is at 60°
      // FULLSTACK (index 2) is at 120°
      // QA (index 3) is at 180°
      // DEVOPS (index 4) is at 240°
      // MOBILE (index 5) is at 300°
      // Calculate which skill axis this click is closest to
      const skillIndex = Math.floor((adjustedAngle + 30) / 60) % skillAreas.length;
      const targetSkillAngle = skillIndex * 60; // Target angle for this skill
      
      // Calculate angular distance from the target skill axis
      let angularDiff = Math.abs(adjustedAngle - targetSkillAngle);
      if (angularDiff > 180) angularDiff = 360 - angularDiff;
      
      // Only register clicks that are within 30 degrees of a skill axis
      // This prevents clicks along the long radial grid lines
      if (angularDiff > 30) return;
      
      const percentage = Math.min(100, Math.max(0, (distance / maxDistance) * 100));
      const roundedValue = Math.round(percentage / 5) * 5;
      
      const area = skillAreas[skillIndex];
      onSkillChange(area, roundedValue);
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full cursor-crosshair select-none relative"
      style={{ minHeight: '400px' }}
    >
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart
          data={data}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <PolarGrid stroke="#64748b" strokeWidth={1} />
          <PolarAngleAxis
            dataKey="skill"
            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#64748b', fontSize: 10 }}
            tickCount={6}
          />
          <Radar
            name="Proficiency"
            dataKey="value"
            stroke="#22c55e"
            fill="#22c55e"
            fillOpacity={0.6}
            strokeWidth={2}
            dot={{ fill: '#22c55e', r: 4 }}
            activeDot={{ r: 6, fill: '#16a34a' }}
          />
        </RadarChart>
      </ResponsiveContainer>
      {/* Invisible overlay to capture clicks */}
      <div
        className="absolute inset-0 cursor-crosshair z-10"
        onClick={handleClick}
        onMouseMove={(e) => {
          // Visual feedback on hover
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const mouseX = e.clientX - centerX;
            const mouseY = e.clientY - centerY;
            const distance = Math.sqrt(mouseX * mouseX + mouseY * mouseY);
            const maxDistance = Math.min(rect.width, rect.height) / 2 - 40;
            
            if (distance <= maxDistance) {
              e.currentTarget.style.cursor = 'crosshair';
            } else {
              e.currentTarget.style.cursor = 'default';
            }
          }
        }}
        style={{ pointerEvents: 'auto' }}
      />
    </div>
  );
}

