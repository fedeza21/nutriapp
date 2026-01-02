
import React, { useState } from 'react';
import { Recipe } from '../types';
import { Clock, Sparkles, ChefHat, X, ChevronRight, RefreshCw } from 'lucide-react';

interface RecipesViewProps {
  recipes: Recipe[];
}

const RecipeSkeleton = () => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 space-y-4 relative overflow-hidden">
    <div className="flex justify-between items-start">
      <div className="flex-1 space-y-2">
        <div className="h-6 w-3/4 bg-gray-100 rounded-lg animate-pulse"></div>
        <div className="flex gap-2">
          <div className="h-4 w-16 bg-gray-50 rounded-full animate-pulse"></div>
          <div className="h-4 w-20 bg-gray-50 rounded-full animate-pulse"></div>
        </div>
      </div>
      <div className="w-10 h-10 bg-gray-100 rounded-xl animate-pulse"></div>
    </div>
    <div className="space-y-1">
      <div className="h-3 w-full bg-gray-50 rounded animate-pulse"></div>
      <div className="h-3 w-5/6 bg-gray-50 rounded animate-pulse"></div>
    </div>
    {/* Efecto Shimmer CSS */}
    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]"></div>
  </div>
);

const RecipesView: React.FC<RecipesViewProps> = ({ recipes }) => {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  return (
    <div className="max-w-md mx-auto px-6 pb-40 pt-10 animate-in fade-in duration-300">
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>

      <div className="mb-10 text-center">
        <div className="inline-block bg-purple-100 p-4 rounded-[2rem] mb-4">
          <ChefHat className="text-purple-600 w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Recetas para ti</h1>
        <p className="text-sm text-gray-500 font-medium">Personalizadas según tu perfil IA.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {recipes.length === 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-2 py-4">
               <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
               <span className="text-xs font-black text-purple-400 uppercase tracking-widest">IA Preparando recetas...</span>
            </div>
            <RecipeSkeleton />
            <RecipeSkeleton />
            <RecipeSkeleton />
            <RecipeSkeleton />
          </div>
        ) : (
          recipes.map((recipe, index) => (
            <button
              key={recipe.id}
              onClick={() => setSelectedRecipe(recipe)}
              className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col text-left transition-all hover:border-purple-200 hover:shadow-xl hover:shadow-purple-50 group animate-in slide-in-from-bottom duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-black text-gray-900 leading-tight pr-4">{recipe.title}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-1 rounded-full uppercase">{recipe.calories} kcal</span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase"><Clock className="w-3 h-3"/> {recipe.time}</span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <ChevronRight className="w-5 h-5"/>
                </div>
              </div>
              <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed font-medium">{recipe.description}</p>
            </button>
          ))
        )}
      </div>

      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xl z-[200] flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-md h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-[3rem] sm:rounded-[3rem] p-8 overflow-y-auto no-scrollbar relative animate-in slide-in-from-bottom duration-500">
            <button 
              onClick={() => setSelectedRecipe(null)} 
              className="absolute top-6 right-6 p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors z-10"
            >
              <X className="w-6 h-6"/>
            </button>

            <div className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="text-purple-500 w-5 h-5"/>
                <span className="text-xs font-black text-purple-500 uppercase tracking-[0.2em]">Recomendación IA</span>
              </div>
              <h2 className="text-3xl font-black text-gray-900 leading-tight mb-4 pr-12">{selectedRecipe.title}</h2>
              
              <div className="grid grid-cols-4 gap-2 mb-8">
                {[
                  { label: 'Kcal', val: selectedRecipe.calories, color: 'text-gray-900' },
                  { label: 'Prot', val: `${selectedRecipe.protein}g`, color: 'text-rose-500' },
                  { label: 'Carb', val: `${selectedRecipe.carbs}g`, color: 'text-sky-500' },
                  { label: 'Grasa', val: `${selectedRecipe.fat}g`, color: 'text-amber-500' }
                ].map(stat => (
                  <div key={stat.label} className="bg-gray-50 p-3 rounded-2xl text-center">
                    <p className={`text-base font-black ${stat.color}`}>{stat.val}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-black mb-4 flex items-center gap-2">Ingredientes <div className="h-px bg-gray-100 flex-1"></div></h3>
                <ul className="space-y-3">
                  {selectedRecipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex gap-3 text-sm font-medium text-gray-600 bg-gray-50 p-3 rounded-xl">
                      <span className="text-purple-500 font-black">/</span> {ing}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-12">
                <h3 className="text-lg font-black mb-4 flex items-center gap-2">Instrucciones <div className="h-px bg-gray-100 flex-1"></div></h3>
                <div className="space-y-6">
                  {selectedRecipe.steps.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs font-black flex-shrink-0">{i+1}</div>
                      <p className="text-sm font-medium text-gray-700 leading-relaxed pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setSelectedRecipe(null)} 
                className="w-full py-5 bg-black text-white font-black rounded-2xl shadow-xl transition-all hover:bg-gray-800"
              >
                Cerrar Receta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipesView;
