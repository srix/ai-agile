import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, User, TrendingUp } from 'lucide-react';
import { useSimulationStore } from '../state/simulationStore';
import { TeamMember, SkillLevel, SkillArea } from '../types';
import { calculateTeamCapacity } from '../utils/teamCapacity';

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

  const capacity = calculateTeamCapacity(team);

  const handleAddMember = () => {
    if (!newMember.name) return;

    const member: TeamMember = {
      id: `member-${Date.now()}`,
      name: newMember.name,
      skills: newMember.skills || {
        backend: null,
        frontend: null,
        fullstack: null,
        qa: null,
        devops: null,
        mobile: null,
      },
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
    setShowAddForm(false);
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
        <div className="space-y-4 mb-6">
          {team.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              onUpdate={(updates) => updateTeamMember(member.id, updates)}
              onRemove={() => removeTeamMember(member.id)}
            />
          ))}
        </div>

        {/* Add Member Button/Form */}
        {!showAddForm ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddForm(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Team Member
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-6"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Add New Team Member</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Name</label>
                <input
                  type="text"
                  value={newMember.name || ''}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                  placeholder="Enter team member name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Availability</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={newMember.availability || 1.0}
                  onChange={(e) => setNewMember({ ...newMember, availability: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {(newMember.availability || 1.0) * 100}% available
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Skills</label>
                <div className="grid grid-cols-2 gap-3">
                  {skillAreas.map((area) => (
                    <div key={area} className="flex items-center gap-2">
                      <span className="text-sm text-slate-700 dark:text-slate-300 w-24 capitalize">{area}</span>
                      <select
                        value={newMember.skills?.[area] || ''}
                        onChange={(e) =>
                          setNewMember({
                            ...newMember,
                            skills: {
                              ...newMember.skills,
                              [area]: e.target.value || null,
                            } as Record<SkillArea, SkillLevel | null>,
                          })
                        }
                        className="flex-1 px-3 py-1 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                      >
                        <option value="">None</option>
                        {skillLevels.map((level) => (
                          <option key={level} value={level}>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddMember}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
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
                  }}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-slate-200 dark:border-slate-700"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            {isEditing ? (
              <input
                type="text"
                value={editableMember.name}
                onChange={(e) => setEditableMember({ ...editableMember, name: e.target.value })}
                className="text-lg font-semibold text-slate-900 dark:text-slate-100 border-b border-blue-500 dark:border-blue-400 focus:outline-none bg-transparent"
              />
            ) : (
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{member.name}</h3>
            )}
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {Math.round(member.availability * 100)}% available
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium text-sm"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditableMember(member);
                }}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 font-medium text-sm"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm"
              >
                Edit
              </button>
              <button
                onClick={onRemove}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium text-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Skills:</p>
        <div className="flex flex-wrap gap-2">
          {activeSkills.length > 0 ? (
            activeSkills.map(([area, level]) => (
              <span
                key={area}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm capitalize"
              >
                {area} ({level})
              </span>
            ))
          ) : (
            <span className="text-slate-400 dark:text-slate-500 text-sm">No skills defined</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

