import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, TrendingUp, Users } from 'lucide-react';
import { useSimulationStore } from '../state/simulationStore';
import { planSprints } from '../utils/sprintPlanner';
import { calculateTeamCapacity } from '../utils/teamCapacity';
import { Sprint, Story } from '../types';

export default function SprintPlanningScreen() {
  const { epic, team, sprints, setSprints, setCurrentScreen } = useSimulationStore();
  const [plannedSprints, setPlannedSprints] = useState<Sprint[]>(sprints);
  const [isPlanning, setIsPlanning] = useState(false);

  const handleAutoPlan = useCallback(() => {
    if (!epic || team.length === 0) return;

    setIsPlanning(true);
    // Simulate AI planning delay
    setTimeout(() => {
      const newSprints = planSprints(epic.stories, team);
      setPlannedSprints(newSprints);
      setIsPlanning(false);
    }, 800);
  }, [epic, team]);

  useEffect(() => {
    if (epic && team.length > 0 && plannedSprints.length === 0) {
      handleAutoPlan();
    }
  }, [epic, team, plannedSprints.length, handleAutoPlan]);

  const handleStoryMove = (storyId: string, fromSprintId: number, toSprintId: number) => {
    if (fromSprintId === toSprintId) return;

    const updatedSprints = plannedSprints.map((sprint) => {
      if (sprint.id === fromSprintId) {
        return {
          ...sprint,
          stories: sprint.stories.filter((s) => s.id !== storyId),
          plannedPoints: sprint.plannedPoints - (sprint.stories.find((s) => s.id === storyId)?.points || 0),
        };
      }
      if (sprint.id === toSprintId) {
        const story = plannedSprints
          .find((s) => s.id === fromSprintId)
          ?.stories.find((s) => s.id === storyId);
        if (story) {
          return {
            ...sprint,
            stories: [...sprint.stories, { ...story, assignedSprint: toSprintId }],
            plannedPoints: sprint.plannedPoints + story.points,
          };
        }
      }
      return sprint;
    });

    setPlannedSprints(updatedSprints);
  };

  const handleAcceptPlan = () => {
    setSprints(plannedSprints);
    // Update epic with assigned sprints
    if (epic) {
      const updatedStories = epic.stories.map((story) => {
        const assignedSprint = plannedSprints.find((s) =>
          s.stories.some((s) => s.id === story.id)
        );
        return {
          ...story,
          assignedSprint: assignedSprint?.id,
        };
      });
      // Note: We'd need to update epic in store, but for now we'll just proceed
    }
  };

  const handleContinue = () => {
    if (plannedSprints.length > 0) {
      handleAcceptPlan();
      setCurrentScreen('sprint');
    }
  };

  const handleBack = () => {
    setCurrentScreen('epic');
  };

  if (!epic || team.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Missing Requirements</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Please complete team setup and epic definition first.
          </p>
        </div>
      </div>
    );
  }

  const { weeklyCapacity } = calculateTeamCapacity(team);
  const sprintCapacity = Math.floor(weeklyCapacity);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
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
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">Sprint Planning</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            AI suggests sprint assignments based on team capacity. Review and adjust as needed.
          </p>
        </motion.div>

        {/* Team Capacity Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Team Capacity</h2>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Team Members</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{team.length}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Weekly Capacity</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {weeklyCapacity.toFixed(1)} pts
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Sprint Capacity</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{sprintCapacity} pts</p>
            </div>
          </div>
        </motion.div>

        {/* Epic Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-1">{epic.title}</h2>
              <p className="text-slate-600 dark:text-slate-400">{epic.description}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Points</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{epic.totalPoints}</p>
            </div>
          </div>
        </motion.div>

        {/* Planning Controls */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleAutoPlan}
            disabled={isPlanning}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
          >
            {isPlanning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Planning...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4" />
                Re-plan Sprints
              </>
            )}
          </button>
          {plannedSprints.length > 0 && (
            <button
              onClick={handleAcceptPlan}
              className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Accept Plan
            </button>
          )}
        </div>

        {/* Sprint Cards */}
        {isPlanning ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">AI is planning your sprints...</p>
            </div>
          </div>
        ) : plannedSprints.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plannedSprints.map((sprint, index) => {
              const utilization = (sprint.plannedPoints / sprint.capacity) * 100;
              const isOverCapacity = sprint.plannedPoints > sprint.capacity;

              return (
                <motion.div
                  key={sprint.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {sprint.name}
                      </h3>
                    </div>
                    {isOverCapacity && (
                      <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
                    )}
                  </div>

                  {/* Capacity Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600 dark:text-slate-400">
                        {sprint.plannedPoints} / {sprint.capacity} pts
                      </span>
                      <span
                        className={`font-medium ${
                          isOverCapacity
                            ? 'text-red-600 dark:text-red-400'
                            : utilization > 90
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-green-600 dark:text-green-400'
                        }`}
                      >
                        {utilization.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          isOverCapacity
                            ? 'bg-red-500 dark:bg-red-600'
                            : utilization > 90
                            ? 'bg-yellow-500 dark:bg-yellow-600'
                            : 'bg-green-500 dark:bg-green-600'
                        }`}
                        style={{ width: `${Math.min(utilization, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Stories List */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {sprint.stories.map((story) => (
                      <div
                        key={story.id}
                        className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-slate-50 dark:bg-slate-900/50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
                              {story.title}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                              {story.description}
                            </p>
                          </div>
                          <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs font-medium whitespace-nowrap">
                            {story.points} pts
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-12 text-center">
            <Calendar className="w-16 h-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No Sprints Planned
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Click "Re-plan Sprints" to generate a sprint plan based on your team capacity.
            </p>
            <button
              onClick={handleAutoPlan}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Plan Sprints
            </button>
          </div>
        )}

        {/* Continue Button */}
        {plannedSprints.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 flex justify-end"
          >
            <button
              onClick={handleContinue}
              className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg flex items-center gap-2 transition-colors"
            >
              Start Sprint Simulation
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

