
import React from 'react';
import { UserProfile, DailyLog, Meal } from '../scr/types';
import ProgressBar from './ui/ProgressBar';
import { Flame, Sparkles, Trash2, Edit2, ExternalLink, ShieldCheck } from 'lucide-react';

interface DashboardProps {
  profile: UserProfile;
  todayLog: DailyLog;
  streak: number;
  onEditMeal: (meal: Meal) => void;
  onRemoveMeal: (mealId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  profile,
  todayLog,
  streak,
  onEditMeal,
  onRemoveMeal
}) => {
  const totals = todayLog.meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const remainingCals = Math.max(0, profile.targetCalories - totals.calories);

  return (
    <div className="max-w-md mx-auto px-6 pb-40 pt-10">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-3 rounded-2xl shadow-sm">
            <Flame className="text-orange-600 w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest">Racha Actual</p>
            <p className="text-xl font-black text-gray-900 leading-none">{streak} días</p>
          </div>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-2xl flex items-center gap-2 border border-blue-100">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Free Plan</span>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-10 text-center mb-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5"><Sparkles className="w-12 h-12" /></div>
        <span className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 block">Energía Restante</span>
        <div className="my-2">
          <span className="text-8xl font-black text-gray-900 tracking-tighter tabular-nums">{remainingCals}</span>
        </div>
        <div className="flex justify-center items-center gap-2 mt-4">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm font-bold text-gray-500">{totals.calories} de {profile.targetCalories} kcal</span>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 space-y-6 mb-10">
        <ProgressBar label="Proteína" current={totals.protein} max={profile.targetProtein} color="bg-rose-500" />
        <ProgressBar label="Carbohidratos" current={totals.carbs} max={profile.targetCarbs} color="bg-sky-500" />
        <ProgressBar label="Grasas" current={totals.fat} max={profile.targetFat} color="bg-amber-500" />
      </div>

      {/* Banner de Monetización Refinado */}
      <div className="mb-10 px-2">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-5 flex items-center justify-between group cursor-pointer shadow-lg shadow-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] leading-none mb-1">Patrocinado</p>
              <p className="text-sm font-bold text-white">Hazte PRO y elimina anuncios</p>
            </div>
          </div>
          <div className="bg-blue-500 p-2 rounded-xl group-hover:bg-blue-400 transition-colors">
            <ExternalLink className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Comidas de Hoy</h3>
            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{todayLog.meals.length} items</span>
        </div>
        {todayLog.meals.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2.5rem]">
            <p className="text-sm font-bold text-gray-400">Pulsa el botón "+" para empezar</p>
          </div>
        ) : (
          todayLog.meals.map((meal) => (
            <div key={meal.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex justify-between items-center group transition-all hover:border-gray-300">
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-base">{meal.name}</h4>
                <div className="flex gap-2 items-center mt-1">
                  <span className="text-[10px] font-black text-white bg-black px-2 py-0.5 rounded-full uppercase">{meal.calories} kcal</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">P: {meal.protein}g • C: {meal.carbs}g • G: {meal.fat}g</span>
                </div>
              </div>
              <div className="flex gap-1 ml-2">
                <button onClick={() => onEditMeal(meal)} className="p-3 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => onRemoveMeal(meal.id)} className="p-3 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
