import React, { useEffect, useState } from 'react';
import { Home, Target, ChefHat, User, Plus } from 'lucide-react';

import { UserProfile, AppState, Meal } from './types';
import Dashboard from '../components/Dashboard';
import Onboarding from '../components/Onboarding';
import History from '../components/History';
import RecipesView from '../components/RecipesView';
import MealModal from '../components/MealModal';

import { getTodayKey } from './utils/calculations';
import { getPersonalizedRecipes } from './services/geminiService';

const STORAGE_KEY = 'nutri_app_state_v3';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        console.warn('LocalStorage corrupto, reiniciando estado');
      }
    }
    return {
      profile: null,
      logs: {},
      streak: 0,
      recommendedRecipes: []
    };
  });

  const [view, setView] = useState<'dashboard' | 'goals' | 'recipes'>('dashboard');
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateRecipes = async (profile: UserProfile) => {
    const recipes = await getPersonalizedRecipes(profile);
    setState(prev => ({ ...prev, recommendedRecipes: recipes }));
  };

  const handleProfileComplete = (profile: UserProfile) => {
    setState(prev => ({ ...prev, profile }));
    updateRecipes(profile);
    setView('dashboard');
  };

  const handleSaveMeal = (mealData: Omit<Meal, 'id' | 'timestamp'>) => {
    const todayKey = getTodayKey();

    setState(prev => {
      const todayLog = prev.logs[todayKey] || { date: todayKey, meals: [] };

      if (editingMeal) {
        return {
          ...prev,
          logs: {
            ...prev.logs,
            [todayKey]: {
              ...todayLog,
              meals: todayLog.meals.map(m =>
                m.id === editingMeal.id ? { ...m, ...mealData } : m
              )
            }
          }
        };
      }

      const newMeal: Meal = {
        ...mealData,
        id: crypto.randomUUID(),
        timestamp: Date.now()
      };

      return {
        ...prev,
        logs: {
          ...prev.logs,
          [todayKey]: {
            ...todayLog,
            meals: [...todayLog.meals, newMeal]
          }
        }
      };
    });

    setEditingMeal(null);
  };

  const handleRemoveMeal = (mealId: string) => {
    const todayKey = getTodayKey();
    setState(prev => {
      const todayLog = prev.logs[todayKey];
      if (!todayLog) return prev;

      return {
        ...prev,
        logs: {
          ...prev.logs,
          [todayKey]: {
            ...todayLog,
            meals: todayLog.meals.filter(m => m.id !== mealId)
          }
        }
      };
    });
  };

  if (!state.profile) {
    return <Onboarding onComplete={handleProfileComplete} />;
  }

  const todayKey = getTodayKey();
  const todayLog = state.logs[todayKey] || { date: todayKey, meals: [] };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 overflow-y-auto">
        {view === 'dashboard' && (
          <Dashboard
            profile={state.profile}
            todayLog={todayLog}
            streak={state.streak}
            onEditMeal={setEditingMeal}
            onRemoveMeal={handleRemoveMeal}
          />
        )}

        {view === 'goals' && (
          <History
            logs={state.logs}
            profile={state.profile}
            onClose={() => setView('dashboard')}
          />
        )}

        {view === 'recipes' && (
          <RecipesView recipes={state.recommendedRecipes} />
        )}
      </main>

      <MealModal
        isOpen={isMealModalOpen}
        onClose={() => {
          setIsMealModalOpen(false);
          setEditingMeal(null);
        }}
        onSave={handleSaveMeal}
        editingMeal={editingMeal}
      />

      {/* NAVBAR */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-md bg-white/80 backdrop-blur-2xl border border-white/20 shadow-xl rounded-[3.5rem] p-2 flex justify-between items-center z-50">
        <button onClick={() => setView('dashboard')} className="nav-btn">
          <Home />
          Casa
        </button>

        <button onClick={() => setView('goals')} className="nav-btn">
          <Target />
          Metas
        </button>

        <button
          onClick={() => setIsMealModalOpen(true)}
          className="bg-black text-white w-16 h-16 rounded-full flex items-center justify-center shadow-2xl"
        >
          <Plus />
        </button>

        <button onClick={() => setView('recipes')} className="nav-btn">
          <ChefHat />
          Cocina
        </button>

        <button
          onClick={() => setState(prev => ({ ...prev, profile: null }))}
          className="nav-btn"
        >
          <User />
          Perfil
        </button>
      </div>
    </div>
  );
};

export default App;
