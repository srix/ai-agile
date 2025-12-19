import { useEffect } from 'react';
import { useSimulationStore } from './state/simulationStore';
import { useThemeStore } from './state/themeStore';
import TeamSetupScreen from './screens/TeamSetupScreen';
import EpicBreakdownScreen from './screens/EpicBreakdownScreen';
import SprintPlanningScreen from './screens/SprintPlanningScreen';
import SprintSimulationScreen from './screens/SprintSimulationScreen';
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
      {currentScreen === 'planning' && <SprintPlanningScreen />}
      {currentScreen === 'sprint' && <SprintSimulationScreen />}
    </div>
  );
}

export default App;

