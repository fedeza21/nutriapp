
import React, { useState, useEffect } from 'react';
import { UserProfile, DailyLog, AppState, Meal } from './types';
import Dashboard from '../components/Dashboard';
import Onboarding from '../components/Onboarding';
import History from '../components/History';
import RecipesView from '../components/RecipesView';
import MealModal from '../components/MealModal';
import { getTodayKey } from '../utils/calculations';
import { getPersonalizedRecipes } from './services/geminiService';
import { Home, Target, ChefHat, User, Plus } from 'lucide-react';

const STORAGE_KEY = 'nutri_app_state_v3';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse storage", e);
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
        // Editar existente
        return {
          ...prev,
          logs: {
            ...prev.logs,
            [todayKey]: {
              ...todayLog,
              meals: todayLog.meals.map(m => m.id === editingMeal.id ? { ...m, ...mealData } : m)
            }
          }
        };
      } else {
        // Añadir nuevo
        const newMeal: Meal = {
          ...mealData,
          id: Math.random().toString(36).substr(2, 9),
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
      }
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

  const openEditModal = (meal: Meal) => {
    setEditingMeal(meal);
    setIsMealModalOpen(true);
  };

  if (!state.profile) {
    return (
      <Onboarding 
        onComplete={handleProfileComplete} 
        onCancel={() => setView('dashboard')}
        initialProfile={state.profile} 
      />
    );
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
            onEditMeal={openEditModal}
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

      {/* Modal Global de Comidas */}
      <MealModal 
        isOpen={isMealModalOpen}
        onClose={() => {
          setIsMealModalOpen(false);
          setEditingMeal(null);
        }}
        onSave={handleSaveMeal}
        editingMeal={editingMeal}
      />

      {/* Modern Navigation Bar with Central Add Button */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-md bg-white/80 backdrop-blur-2xl border border-white/20 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] rounded-[3.5rem] p-2 flex justify-between items-center z-[150]">
        <button 
          onClick={() => setView('dashboard')} 
          className={`flex flex-col items-center gap-1 flex-1 py-4 rounded-[3rem] transition-all ${view === 'dashboard' ? 'bg-black text-white' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-widest">Casa</span>
        </button>
        
        <button 
          onClick={() => setView('goals')} 
          className={`flex flex-col items-center gap-1 flex-1 py-4 rounded-[3rem] transition-all ${view === 'goals' ? 'bg-black text-white' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Target className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-widest">Metas</span>
        </button>

        {/* Central Add Button (Prominent) */}
        <div className="relative -top-6 px-2">
          <button 
            onClick={() => setIsMealModalOpen(true)}
            className="bg-black text-white w-16 h-16 rounded-full flex items-center justify-center shadow-2xl shadow-black/40 hover:scale-110 active:scale-95 transition-all border-4 border-white"
          >
            <Plus className="w-8 h-8 stroke-[3]" />
          </button>
        </div>

       <button 
  onClick={() => setView('recipes')} 
  className={`flex flex-col items-center gap-1 flex-1 py-4 rounded-[3rem] transition-all ${
    view === 'recipes'
      ? 'bg-black text-white'
      : 'text-gray-400 hover:text-gray-600'
  }`}
>
  <ChefHat className="w-5 h-5" />
  <span className="text-[10px] font-black uppercase tracking-widest">Cocina</span>
</button>

<button 
  onClick={() => setState(prev => ({ ...prev, profile: null }))}
  className="flex flex-col items-center gap-1 flex-1 py-4 rounded-[3rem] text-gray-400 hover:text-gray-600 transition-all"
>
  <User className="w-5 h-5" />
  <span className="text-[10px] font-black uppercase tracking-widest">Perfil</span>
</button>

      </div>
    </div>
  );
};

export default App;
