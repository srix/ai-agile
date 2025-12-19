import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, User, TrendingUp, RotateCcw } from 'lucide-react';
import { useSimulationStore } from '../state/simulationStore';
import { TeamMember, SkillLevel, SkillArea } from '../types';
import { calculateTeamCapacity } from '../utils/teamCapacity';
import { percentageToSkillLevel, getSkillLevelLabel } from '../utils/skillLevelMapper';

const skillAreas: SkillArea[] = ['backend', 'frontend', 'fullstack', 'qa', 'devops', 'mobile'];
const skillLevels: SkillLevel[] = ['junior', 'mid', 'senior', 'lead'];

export default function TeamSetupScreen() {
  const { team, addTeamMember, updateTeamMember, removeTeamMember, setCurrentScreen } = useSimulationStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState<Partial<TeamMember>>({
    name: '',
    skills: {
      backend: null,
      frontend: null,
      fullstack: null,
      qa: null,
      devops: null,
      mobile: null,
    },
    availability: 1.0,
  });
  
  // Track skill percentages separately for sliders
  const [skillPercentages, setSkillPercentages] = useState<Record<SkillArea, number>>({
    backend: 0,
    frontend: 0,
    fullstack: 0,
    qa: 0,
    devops: 0,
    mobile: 0,
  });

  const capacity = calculateTeamCapacity(team);

  const handleAddMember = () => {
    if (!newMember.name) return;

    // Convert skill percentages to skill levels
    const skills: Record<SkillArea, SkillLevel | null> = {
      backend: percentageToSkillLevel(skillPercentages.backend),
      frontend: percentageToSkillLevel(skillPercentages.frontend),
      fullstack: percentageToSkillLevel(skillPercentages.fullstack),
      qa: percentageToSkillLevel(skillPercentages.qa),
      devops: percentageToSkillLevel(skillPercentages.devops),
      mobile: percentageToSkillLevel(skillPercentages.mobile),
    };

    const member: TeamMember = {
      id: `member-${Date.now()}`,
      name: newMember.name,
      skills,
      availability: newMember.availability || 1.0,
    };

    addTeamMember(member);
    setNewMember({
      name: '',
      skills: {
        backend: null,
        frontend: null,
        fullstack: null,
        qa: null,
        devops: null,
        mobile: null,
      },
      availability: 1.0,
    });
    setSkillPercentages({
      backend: 0,
      frontend: 0,
      fullstack: 0,
      qa: 0,
      devops: 0,
      mobile: 0,
    });
    setShowAddForm(false);
  };

  const handleResetSkills = () => {
    setSkillPercentages({
      backend: 0,
      frontend: 0,
      fullstack: 0,
      qa: 0,
      devops: 0,
      mobile: 0,
    });
  };


  const handleContinue = () => {
    if (team.length > 0) {
      setCurrentScreen('epic');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">Team Definition</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Capture team capability, not just size. Planning quality depends on team capability clarity.
          </p>
        </motion.div>

        {/* Capacity Summary */}
        {team.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-6 border-l-4 border-blue-500 dark:border-blue-400"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Team Capacity</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Daily Capacity</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{capacity.dailyCapacity.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Weekly Capacity</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{capacity.weeklyCapacity.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Team Members</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{team.length}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Team Members List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {team.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              onUpdate={(updates) => updateTeamMember(member.id, updates)}
              onRemove={() => removeTeamMember(member.id)}
            />
          ))}
          
          {/* Add Member Button */}
          {!showAddForm && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddForm(true)}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 transition-all flex flex-col items-center justify-center gap-2 min-h-[120px] text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-medium">Add Team Member</span>
            </motion.button>
          )}
        </div>

        {/* Add Member Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 mb-6 max-w-lg mx-auto"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-3">Add New Team Member</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  value={newMember.name || ''}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                  placeholder="Enter team member name"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Availability</label>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-slate-600 dark:text-slate-400">Part-time</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={newMember.availability || 1.0}
                    onChange={(e) => setNewMember({ ...newMember, availability: parseFloat(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400">Full-time</span>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 font-medium text-center">
                  {Math.round((newMember.availability || 1.0) * 100)}% Capacity
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">Skill Proficiency Matrix</label>
                  <button
                    onClick={handleResetSkills}
                    className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset Values
                  </button>
                </div>
                <div className="space-y-2">
                  {skillAreas.map((area) => {
                    const percentage = skillPercentages[area];
                    const label = getSkillLevelLabel(percentage);
                    return (
                      <div key={area} className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 capitalize w-24 flex-shrink-0">
                          {area === 'qa' ? 'QA & Testing' : area}
                        </span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={percentage}
                          onChange={(e) =>
                            setSkillPercentages({
                              ...skillPercentages,
                              [area]: parseInt(e.target.value),
                            })
                          }
                          className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                          style={{
                            background: `linear-gradient(to right, rgb(34, 197, 94) 0%, rgb(34, 197, 94) ${percentage}%, rgb(226, 232, 240) ${percentage}%, rgb(226, 232, 240) 100%)`,
                          }}
                        />
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium w-20 text-right flex-shrink-0">
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleAddMember}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium text-sm py-1.5 px-4 rounded-lg transition-colors"
                >
                  Add Member
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewMember({
                      name: '',
                      skills: {
                        backend: null,
                        frontend: null,
                        fullstack: null,
                        qa: null,
                        devops: null,
                        mobile: null,
                      },
                      availability: 1.0,
                    });
                    setSkillPercentages({
                      backend: 0,
                      frontend: 0,
                      fullstack: 0,
                      qa: 0,
                      devops: 0,
                      mobile: 0,
                    });
                  }}
                  className="px-4 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Continue Button */}
        {team.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 flex justify-end"
          >
            <button
              onClick={handleContinue}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Continue to Epic Definition →
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function TeamMemberCard({
  member,
  onUpdate,
  onRemove,
}: {
  member: TeamMember;
  onUpdate: (updates: Partial<TeamMember>) => void;
  onRemove: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableMember, setEditableMember] = useState(member);

  const handleSave = () => {
    onUpdate(editableMember);
    setIsEditing(false);
  };

  const activeSkills = Object.entries(member.skills).filter(([_, level]) => level !== null);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                type="text"
                value={editableMember.name}
                onChange={(e) => setEditableMember({ ...editableMember, name: e.target.value })}
                className="text-sm font-semibold text-slate-900 dark:text-slate-100 border-b border-blue-500 dark:border-blue-400 focus:outline-none bg-transparent w-full"
              />
            ) : (
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{member.name}</h3>
            )}
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {Math.round(member.availability * 100)}% available
            </p>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-xs font-medium p-1"
                title="Save"
              >
                ✓
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditableMember(member);
                }}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 text-xs font-medium p-1"
                title="Cancel"
              >
                ✕
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-medium p-1"
                title="Edit"
              >
                ✎
              </button>
              <button
                onClick={onRemove}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs font-medium p-1"
                title="Remove"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-2">
        <div className="flex flex-wrap gap-1">
          {activeSkills.length > 0 ? (
            activeSkills.slice(0, 3).map(([area, level]) => (
              <span
                key={area}
                className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs capitalize"
                title={`${area} (${level})`}
              >
                {area.substring(0, 4)} ({level?.charAt(0)})
              </span>
            ))
          ) : (
            <span className="text-slate-400 dark:text-slate-500 text-xs">No skills</span>
          )}
          {activeSkills.length > 3 && (
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs">
              +{activeSkills.length - 3}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

