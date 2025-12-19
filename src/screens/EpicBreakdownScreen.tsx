import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, FileText, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useSimulationStore } from '../state/simulationStore';
import { createEpicFromDescription } from '../utils/storyGenerator';

export default function EpicBreakdownScreen() {
  const { epic, setEpic, setCurrentScreen, team } = useSimulationStore();
  const [epicTitle, setEpicTitle] = useState(epic?.title || '');
  const [epicDescription, setEpicDescription] = useState(epic?.description || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEpic, setGeneratedEpic] = useState(epic);

  const handleGenerateStories = async () => {
    if (!epicTitle.trim() || !epicDescription.trim()) {
      alert('Please provide both title and description');
      return;
    }

    setIsGenerating(true);
    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newEpic = createEpicFromDescription(epicTitle, epicDescription);
    setGeneratedEpic(newEpic);
    setIsGenerating(false);
  };

  const handleAcceptEpic = () => {
    if (generatedEpic) {
      setEpic(generatedEpic);
    }
  };

  const handleContinue = () => {
    if (epic) {
      setCurrentScreen('sprint');
    }
  };

  const handleBack = () => {
    setCurrentScreen('team');
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
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">Epic Definition & Breakdown</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Show how AI converts vague ideas into structured work. AI removes cognitive load from breakdown and estimation.
          </p>
        </motion.div>

        {/* Epic Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Define Your Epic</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Epic Title</label>
              <input
                type="text"
                value={epicTitle}
                onChange={(e) => setEpicTitle(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="e.g., User Authentication System"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Epic Description</label>
              <textarea
                value={epicDescription}
                onChange={(e) => setEpicDescription(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="Describe the epic in detail. Include features, requirements, and any technical considerations..."
              />
            </div>
            <button
              onClick={handleGenerateStories}
              disabled={isGenerating || !epicTitle.trim() || !epicDescription.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating stories...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Stories with AI
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Generated Stories */}
        {generatedEpic && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-1">Generated Stories</h2>
                <p className="text-slate-600 dark:text-slate-400">
                  {generatedEpic.stories.length} stories • {generatedEpic.totalPoints} story points total
                </p>
              </div>
              {!epic && (
                <button
                  onClick={handleAcceptEpic}
                  className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Accept Epic
                </button>
              )}
            </div>

            <div className="space-y-4">
              {generatedEpic.stories.map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md dark:hover:shadow-lg transition-shadow bg-slate-50 dark:bg-slate-900/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{story.title}</h3>
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                          {story.points} pts
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 ml-8">{story.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Stories</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{generatedEpic.stories.length}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Points</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{generatedEpic.totalPoints}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Estimated Sprints</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {team.length > 0
                      ? Math.ceil(generatedEpic.totalPoints / (generatedEpic.totalPoints / 2))
                      : '—'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Continue Button */}
        {epic && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 flex justify-end"
          >
            <button
              onClick={handleContinue}
              className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg flex items-center gap-2 transition-colors"
            >
              Continue to Sprint Simulation
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

