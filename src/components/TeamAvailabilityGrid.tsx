import { TeamMember, DayOfWeek, DailyDisruption } from '../types';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

interface ActivitySegment {
  type: 'work' | 'onCall' | 'sick' | 'support' | 'contextSwitch';
  percentage: number;
  color: string;
  label: string;
}

interface TeamAvailabilityGridProps {
  team: TeamMember[];
  dailyDisruptions: Record<DayOfWeek, DailyDisruption[]>;
  currentDay: number;
  selectedMemberId?: string | null;
  onMemberClick?: (memberId: string) => void;
  onDayClick?: (dayNumber: number) => void;
  onPreviousDay?: () => void;
  onNextDay?: () => void;
  canNavigateNext?: boolean;
  isReplanning?: boolean;
  dailyStates?: Array<{ day: DayOfWeek; dayNumber: number }>;
}

/**
 * Calculate activity breakdown for a team member on a specific day
 */
function calculateActivityBreakdown(
  _member: TeamMember,
  disruption: DailyDisruption | undefined
): ActivitySegment[] {
  const segments: ActivitySegment[] = [];
  let remaining = 1; // Start with 100% of the day

  // Sick leave (red) - highest priority
  if (disruption?.sickPercent) {
    const sickPercent = Math.min(disruption.sickPercent, remaining);
    segments.push({
      type: 'sick',
      percentage: sickPercent,
      color: 'bg-red-500',
      label: 'Sick',
    });
    remaining -= sickPercent;
  }

  // On-call (yellow)
  if (disruption?.onCallPercent && remaining > 0) {
    const onCallPercent = Math.min(disruption.onCallPercent, remaining);
    segments.push({
      type: 'onCall',
      percentage: onCallPercent,
      color: 'bg-yellow-500',
      label: 'On-call',
    });
    remaining -= onCallPercent;
  }

  // Support work (orange)
  if (disruption?.supportWork && remaining > 0) {
    // Support work takes 50% of remaining time
    const supportPercent = Math.min(0.5, remaining);
    segments.push({
      type: 'support',
      percentage: supportPercent,
      color: 'bg-orange-500',
      label: 'Support',
    });
    remaining -= supportPercent;
  }

  // Context switching (purple)
  if (disruption?.contextSwitched && remaining > 0) {
    // Context switching reduces by 30%
    const contextPercent = Math.min(0.3, remaining);
    segments.push({
      type: 'contextSwitch',
      percentage: contextPercent,
      color: 'bg-purple-500',
      label: 'Context Switch',
    });
    remaining -= contextPercent;
  }

  // Work on tasks (green) - everything remaining
  if (remaining > 0) {
    segments.push({
      type: 'work',
      percentage: remaining,
      color: 'bg-green-500',
      label: 'Work',
    });
  }

  return segments;
}

export default function TeamAvailabilityGrid({
  team,
  dailyDisruptions,
  currentDay,
  selectedMemberId,
  onMemberClick,
  onDayClick,
  onPreviousDay,
  onNextDay,
  canNavigateNext = false,
  isReplanning = false,
  dailyStates = [],
}: TeamAvailabilityGridProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 overflow-x-auto">
      {/* Header with Timeline Controls */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Sprint Timeline & Team Availability
        </h2>
        <div className="flex items-center gap-2">
          {onPreviousDay && (
            <button
              onClick={onPreviousDay}
              disabled={currentDay === 1}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          )}
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Day {currentDay} of 5
          </span>
          {onNextDay && (
            <button
              onClick={onNextDay}
              disabled={currentDay >= 5 || isReplanning || !canNavigateNext}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Grid Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">
                Team Member
              </th>
              {DAYS.map((day, index) => {
                const dayNumber = index + 1;
                const isActive = dayNumber === currentDay;
                const isPast = dayNumber < currentDay;
                const hasState = dailyStates.some((ds) => ds.dayNumber === dayNumber);
                const hasDisruptions = dailyDisruptions[day]?.some(
                  (d) => d.onCallPercent > 0 || d.sickPercent > 0 || d.supportWork || d.contextSwitched
                );
                const canClick = hasState || dayNumber <= currentDay;

                return (
                  <th
                    key={day}
                    className={`border border-slate-200 dark:border-slate-700 px-4 py-3 text-center text-sm font-semibold min-w-[200px] transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg'
                        : isPast && hasState
                        ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : hasDisruptions
                        ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                    } ${onDayClick && canClick ? 'cursor-pointer hover:opacity-80 hover:scale-105' : canClick ? '' : 'opacity-50'}`}
                    onClick={() => onDayClick && canClick && onDayClick(dayNumber)}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div>{day}</div>
                      <div className="text-xs font-normal">Day {dayNumber}</div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {team.map((member, memberIndex) => {
              const isSelected = selectedMemberId === member.id;
              return (
                <tr
                  key={member.id}
                  onClick={() => onMemberClick && onMemberClick(member.id)}
                  className={`${
                    memberIndex % 2 === 0 ? 'bg-slate-50 dark:bg-slate-900/50' : ''
                  } ${
                    isSelected
                      ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500 dark:ring-blue-400'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  } ${onMemberClick ? 'cursor-pointer transition-colors' : ''}`}
                >
                  <td className={`sticky left-0 z-10 bg-inherit border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100 ${
                    isSelected ? 'font-semibold' : ''
                  }`}>
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                      {member.name}
                    </div>
                  </td>
                {DAYS.map((day) => {
                  const disruption = dailyDisruptions[day]?.find(
                    (d) => d.memberId === member.id
                  );
                  const activities = calculateActivityBreakdown(member, disruption);

                  return (
                    <td
                      key={`${member.id}-${day}`}
                      className="border border-slate-200 dark:border-slate-700 px-4 py-3"
                    >
                      <div className="flex items-center gap-2">
                        {/* Activity Bar */}
                        <div className="flex-1 h-8 bg-slate-200 dark:bg-slate-700 rounded overflow-hidden flex">
                          {activities.map((activity, idx) => (
                            <div
                              key={idx}
                              className={`${activity.color} h-full flex items-center justify-center transition-all`}
                              style={{ width: `${activity.percentage * 100}%` }}
                              title={`${activity.label}: ${(activity.percentage * 100).toFixed(0)}%`}
                            >
                              {activity.percentage > 0.15 && (
                                <span className="text-xs font-medium text-white px-1">
                                  {(activity.percentage * 100).toFixed(0)}%
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
          Activity Legend
        </h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Work on Tasks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded" />
            <span className="text-sm text-slate-600 dark:text-slate-400">On-call</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Sick Leave</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Support Work</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Context Switch</span>
          </div>
        </div>
      </div>
    </div>
  );
}

