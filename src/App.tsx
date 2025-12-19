import { useEffect, useState } from 'react';
import { useSimulationStore } from './state/simulationStore';
import { useThemeStore } from './state/themeStore';
import TeamSetupScreen from './screens/TeamSetupScreen';
import EpicBreakdownScreen from './screens/EpicBreakdownScreen';
import SprintPlanningScreen from './screens/SprintPlanningScreen';
import SprintSimulationScreen from './screens/SprintSimulationScreen';
import ThemeToggle from './components/ThemeToggle';
import { RotateCcw, AlertTriangle } from 'lucide-react';

function App() {
  const { currentScreen, reset, team, epic } = useSimulationStore();
  const { isDark } = useThemeStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleReset = () => {
    if (showResetConfirm) {
      reset();
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => setShowResetConfirm(false), 3000);
    }
  };

  const hasData = team.length > 0 || epic !== null;

  return (
    <div className="App">
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {hasData && (
          <button
            onClick={handleReset}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              showResetConfirm
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
            }`}
            title={showResetConfirm ? 'Click again to confirm reset' : 'Reset all data'}
          >
            {showResetConfirm ? (
              <>
                <AlertTriangle className="w-4 h-4" />
                Confirm Reset
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                Reset
              </>
            )}
          </button>
        )}
        <ThemeToggle />
      </div>
      {currentScreen === 'team' && <TeamSetupScreen />}
      {currentScreen === 'epic' && <EpicBreakdownScreen />}
      {currentScreen === 'planning' && <SprintPlanningScreen />}
      {currentScreen === 'sprint' && <SprintSimulationScreen />}
    </div>
  );
}

export default App;

