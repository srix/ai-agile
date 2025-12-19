import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  TrendingUp,
  AlertCircle,
  Activity,
  Brain,
  ChevronRight,
} from 'lucide-react';
import { useSimulationStore } from '../state/simulationStore';
import {
  calculateEffectiveCapacity,
  simulateDayProgress,
  generateAILog,
  calculateSprintMetrics,
  getDayOfWeek,
} from '../utils/sprintSimulation';
import { calculateTeamCapacity } from '../utils/teamCapacity';
import { DailyDisruption, DailyState, Story, DayOfWeek } from '../types';
import TeamAvailabilityGrid from '../components/TeamAvailabilityGrid';

const DAYS: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export default function SprintSimulationScreen() {
  const { epic, team, sprints, setCurrentScreen } = useSimulationStore();
  const [currentDay, setCurrentDay] = useState(1);
  const [dailyStates, setDailyStates] = useState<DailyState[]>([]);
  const [currentStories, setCurrentStories] = useState<Story[]>([]);
  const [isReplanning, setIsReplanning] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState(sprints[0] || null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  // Initialize with first sprint
  useEffect(() => {
    if (sprints.length > 0 && !selectedSprint) {
      setSelectedSprint(sprints[0]);
    }
  }, [sprints, selectedSprint]);

  // Initialize stories when sprint is selected
  useEffect(() => {
    if (selectedSprint) {
      setCurrentStories(
        selectedSprint.stories.map((s) => ({ ...s, status: 'planned' as const }))
      );
    }
  }, [selectedSprint]);

  // Initialize daily states
  useEffect(() => {
    if (team.length > 0 && dailyStates.length === 0) {
      const initialDisruptions: DailyDisruption[] = team.map((member) => ({
        memberId: member.id,
        onCallPercent: 0,
        sickPercent: 0,
        supportWork: false,
        contextSwitched: false,
      }));

      const initialState: DailyState = {
        day: 'Mon',
        dayNumber: 1,
        disruptions: initialDisruptions,
        completedPoints: 0,
        inProgressPoints: 0,
        remainingPoints: selectedSprint?.plannedPoints || 0,
        velocity: calculateTeamCapacity(team).weeklyCapacity / 5,
        confidence: 100,
        aiLog: ['Sprint started. Initial velocity calculated.'],
      };

      setDailyStates([initialState]);
    }
  }, [team, selectedSprint, dailyStates.length]);

  const currentDayState = dailyStates[currentDay - 1];

  const handleNextDay = useCallback(() => {
    if (currentDay >= 5 || !currentDayState || !selectedSprint) return;

    setIsReplanning(true);

    // Simulate AI re-planning delay
    setTimeout(() => {
      const { completed, inProgress, remaining } = simulateDayProgress(
        currentStories,
        team,
        currentDayState.disruptions,
        currentDay
      );

      // Update story states
      const updatedStories = [
        ...completed,
        ...inProgress,
        ...remaining,
      ];
      setCurrentStories(updatedStories);

      // Calculate total completed points from all completed stories
      const totalCompletedPoints = updatedStories
        .filter((s) => s.status === 'completed')
        .reduce((sum, s) => sum + s.points, 0);
      const inProgressPoints = inProgress.reduce((sum, s) => sum + s.points, 0);
      const remainingPoints = remaining.reduce((sum, s) => sum + s.points, 0);

      const effectiveCapacity = calculateEffectiveCapacity(team, currentDayState.disruptions);
      const newVelocity = effectiveCapacity;

      const metrics = calculateSprintMetrics(
        selectedSprint.plannedPoints,
        totalCompletedPoints,
        inProgressPoints,
        remainingPoints,
        currentDay + 1,
        5,
        newVelocity
      );

      const aiLog = generateAILog(
        team,
        currentDayState.disruptions,
        currentDayState.velocity,
        newVelocity,
        metrics.spilloverRisk
      );

      const nextDayState: DailyState = {
        day: getDayOfWeek(currentDay + 1),
        dayNumber: currentDay + 1,
        disruptions: team.map((member) => ({
          memberId: member.id,
          onCallPercent: 0,
          sickPercent: 0,
          supportWork: false,
          contextSwitched: false,
        })),
        completedPoints: totalCompletedPoints,
        inProgressPoints: metrics.inProgressPoints,
        remainingPoints: metrics.remainingPoints,
        velocity: newVelocity,
        confidence: metrics.confidence,
        aiLog,
      };

      setDailyStates([...dailyStates, nextDayState]);
      setCurrentDay(currentDay + 1);
      setIsReplanning(false);
    }, 1000);
  }, [currentDay, currentDayState, currentStories, team, selectedSprint, dailyStates]);

  const handlePreviousDay = () => {
    if (currentDay > 1) {
      setCurrentDay(currentDay - 1);
    }
  };

  const handleDisruptionChange = (
    field: keyof DailyDisruption,
    value: number | boolean
  ) => {
    if (!currentDayState || !selectedMemberId) return;

    const updatedDisruptions = currentDayState.disruptions.map((d) =>
      d.memberId === selectedMemberId ? { ...d, [field]: value } : d
    );

    const updatedState: DailyState = {
      ...currentDayState,
      disruptions: updatedDisruptions,
    };

    const newDailyStates = [...dailyStates];
    newDailyStates[currentDay - 1] = updatedState;
    setDailyStates(newDailyStates);
  };

  // Auto-select first team member if none selected
  useEffect(() => {
    if (team.length > 0 && !selectedMemberId) {
      setSelectedMemberId(team[0].id);
    }
  }, [team, selectedMemberId]);

  const handleBack = () => {
    setCurrentScreen('planning');
  };

  if (!epic || team.length === 0 || !selectedSprint) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Missing Requirements</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Please complete sprint planning first.
          </p>
        </div>
      </div>
    );
  }

  const metrics = currentDayState
    ? calculateSprintMetrics(
        selectedSprint.plannedPoints,
        currentDayState.completedPoints,
        currentDayState.inProgressPoints,
        currentDayState.remainingPoints,
        currentDay,
        5,
        currentDayState.velocity
      )
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">Sprint Simulation</h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Experience the sprint day by day. See how AI adapts plans based on real-world disruptions.
            </p>
          </motion.div>

          {/* Sprint Selector */}
          {sprints.length > 1 && (
            <div className="mb-6 bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Select Sprint
              </label>
              <select
                value={selectedSprint?.id || ''}
                onChange={(e) => {
                  const sprint = sprints.find((s) => s.id === parseInt(e.target.value));
                  if (sprint) {
                    setSelectedSprint(sprint);
                    setCurrentDay(1);
                    setDailyStates([]);
                    setCurrentStories([]);
                  }
                }}
                className="w-full md:w-auto px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              >
                {sprints.map((sprint) => (
                  <option key={sprint.id} value={sprint.id}>
                    {sprint.name} ({sprint.plannedPoints} pts)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Team Availability Grid - Full Width */}
        {team.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 px-8"
          >
            <TeamAvailabilityGrid
              team={team}
              currentDay={currentDay}
              selectedMemberId={selectedMemberId}
              onMemberClick={setSelectedMemberId}
              onDayClick={(dayNumber) => {
                const hasState = dailyStates[dayNumber - 1] !== undefined;
                if (hasState || dayNumber <= currentDay) {
                  setCurrentDay(dayNumber);
                }
              }}
              onPreviousDay={handlePreviousDay}
              onNextDay={handleNextDay}
              canNavigateNext={currentDay < 5 && dailyStates[currentDay] !== undefined}
              isReplanning={isReplanning}
              dailyStates={dailyStates.map((ds) => ({ day: ds.day, dayNumber: ds.dayNumber }))}
              dailyDisruptions={(() => {
                // Build disruptions map for all days
                const disruptionsMap: Record<DayOfWeek, DailyDisruption[]> = {
                  Mon: [],
                  Tue: [],
                  Wed: [],
                  Thu: [],
                  Fri: [],
                };

                // Initialize all days with default disruptions for all team members
                DAYS.forEach((day) => {
                  disruptionsMap[day] = team.map((member) => {
                    // Find disruption for this day if it exists
                    const dayState = dailyStates.find((ds) => ds.day === day);
                    const disruption = dayState?.disruptions.find(
                      (d) => d.memberId === member.id
                    );

                    // Return existing disruption or default
                    return (
                      disruption || {
                        memberId: member.id,
                        onCallPercent: 0,
                        sickPercent: 0,
                        supportWork: false,
                        contextSwitched: false,
                      }
                    );
                  });
                });

                return disruptionsMap;
              })()}
            />
          </motion.div>
        )}

        {/* Main Content Grid */}
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left: Daily Metrics Dashboard */}
          <div className="lg:col-span-2 space-y-6">
            {metrics && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6"
              >
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  Daily Metrics
                </h2>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Planned</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {metrics.plannedPoints}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Remaining</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {metrics.remainingPoints}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">ETA</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {metrics.eta}d
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Confidence</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {Math.round(metrics.confidence)}%
                    </p>
                  </div>
                </div>

                {/* Progress Visualization */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Progress Breakdown
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600 dark:text-slate-400">Completed</span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {metrics.completedPoints} pts
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-green-500 dark:bg-green-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${(metrics.completedPoints / metrics.plannedPoints) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600 dark:text-slate-400">In Progress</span>
                        <span className="font-medium text-yellow-600 dark:text-yellow-400">
                          {metrics.inProgressPoints} pts
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-yellow-500 dark:bg-yellow-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${(metrics.inProgressPoints / metrics.plannedPoints) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600 dark:text-slate-400">Remaining</span>
                        <span className="font-medium text-slate-600 dark:text-slate-400">
                          {metrics.remainingPoints} pts
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-slate-400 dark:bg-slate-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${(metrics.remainingPoints / metrics.plannedPoints) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Spillover Risk */}
                {metrics.spilloverRisk > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
                      <span className="font-medium text-red-700 dark:text-red-300">
                        Spillover Risk: {Math.round(metrics.spilloverRisk)}%
                      </span>
                    </div>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Current velocity suggests some stories may not be completed within the sprint.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* AI Re-estimation Log */}
            {currentDayState && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6"
              >
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                  AI Re-estimation Log
                </h2>
                <div className="space-y-2">
                  {currentDayState.aiLog.map((log, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg"
                    >
                      <ChevronRight className="w-4 h-4 text-purple-500 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-slate-700 dark:text-slate-300">{log}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right: Disruption Controls */}
          <div className="space-y-6">
            {/* Daily Reality Controls */}
            {currentDayState && selectedMemberId && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6"
              >
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                  Daily Reality Controls
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  Inject real-world disruptions for {currentDayState.day}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 italic">
                  Click a team member in the grid to adjust their availability
                </p>
                {(() => {
                  const selectedMember = team.find((m) => m.id === selectedMemberId);
                  const disruption = currentDayState.disruptions.find(
                    (d) => d.memberId === selectedMemberId
                  );
                  
                  if (!selectedMember || !disruption) return null;

                  return (
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
                      <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        {selectedMember.name}
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                            On-call: {Math.round(disruption.onCallPercent * 100)}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={disruption.onCallPercent}
                            onChange={(e) =>
                              handleDisruptionChange('onCallPercent', parseFloat(e.target.value))
                            }
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                            Sick/Unavailable: {Math.round(disruption.sickPercent * 100)}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={disruption.sickPercent}
                            onChange={(e) =>
                              handleDisruptionChange('sickPercent', parseFloat(e.target.value))
                            }
                            className="w-full"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="support-work"
                            checked={disruption.supportWork}
                            onChange={(e) =>
                              handleDisruptionChange('supportWork', e.target.checked)
                            }
                            className="rounded"
                          />
                          <label
                            htmlFor="support-work"
                            className="text-sm text-slate-700 dark:text-slate-300"
                          >
                            Support work
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="context-switch"
                            checked={disruption.contextSwitched}
                            onChange={(e) =>
                              handleDisruptionChange('contextSwitched', e.target.checked)
                            }
                            className="rounded"
                          />
                          <label
                            htmlFor="context-switch"
                            className="text-sm text-slate-700 dark:text-slate-300"
                          >
                            Context-switched
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* Re-planning Indicator */}
        {isReplanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                AI Re-planning...
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Recalculating remaining work and adjusting forecasts
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

