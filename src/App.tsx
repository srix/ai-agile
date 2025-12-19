import { useEffect } from 'react';
import { useSimulationStore } from './state/simulationStore';
import { useThemeStore } from './state/themeStore';
import TeamSetupScreen from './screens/TeamSetupScreen';
import EpicBreakdownScreen from './screens/EpicBreakdownScreen';
import ThemeToggle from './components/ThemeToggle';

function App() {
  const { currentScreen } = useSimulationStore();
  const { isDark } = useThemeStore();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="App">
      <ThemeToggle />
      {currentScreen === 'team' && <TeamSetupScreen />}
      {currentScreen === 'epic' && <EpicBreakdownScreen />}
      {currentScreen === 'sprint' && (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">Sprint Simulation</h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Coming soon...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

