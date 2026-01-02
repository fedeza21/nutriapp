
import React, { useState } from 'react';
import { Gender, ActivityLevel, Goal, UserProfile } from '../scr/types';
import { calculateGoals } from '../utils/calculations';
import { ChevronRight, Activity, ShieldAlert, Utensils, X, ArrowLeft } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  onCancel?: () => void;
  initialProfile?: UserProfile | null;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onCancel, initialProfile }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    gender: initialProfile?.gender || Gender.MALE,
    age: initialProfile?.age || 0,
    height: initialProfile?.height || 0,
    weight: initialProfile?.weight || 0,
    activityLevel: initialProfile?.activityLevel || ActivityLevel.MODERATE,
    goal: initialProfile?.goal || Goal.MAINTAIN,
    dietType: initialProfile?.dietType || 'Ninguna',
    healthConditions: initialProfile?.healthConditions || []
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  // Validación: Solo permitir avanzar si los datos físicos son reales
  const isStep1Valid = formData.age > 0 && formData.height > 0 && formData.weight > 0;

  const toggleCondition = (condition: string) => {
    if (condition === 'Ninguna de las anteriores') {
      setFormData(prev => ({ ...prev, healthConditions: ['Ninguna de las anteriores'] }));
      return;
    }
    setFormData(prev => {
      const filtered = prev.healthConditions.filter(c => c !== 'Ninguna de las anteriores');
      return {
        ...prev,
        healthConditions: filtered.includes(condition)
          ? filtered.filter(c => c !== condition)
          : [...filtered, condition]
      };
    });
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep1Valid) {
      alert("Por favor, completa tus datos físicos correctamente.");
      setStep(1);
      return;
    }
    const baseGoals = calculateGoals(formData.gender, formData.age, formData.height, formData.weight, formData.activityLevel, formData.goal);
    onComplete({ ...baseGoals, dietType: formData.dietType, healthConditions: formData.healthConditions } as UserProfile);
  };

  const diets = ['Ninguna', 'Vegana', 'Vegetariana', 'Keto', 'Paleo', 'Mediterránea', 'Sin Gluten'];
  
  const conditions = [
    'Ninguna de las anteriores', 
    'Celiaquía (Sin Gluten)', 
    'Intolerancia a la Lactosa', 
    'Diabetes (Control Azúcar)', 
    'Hipertensión (Bajo Sodio)', 
    'Insuficiencia Renal (Control Prot/K)', 
    'Hiperuricemia / Gota (Sin Purinas)', 
    'Gastritis / Reflujo (Sin Irritantes)', 
    'Alergia a Frutos Secos',
    'Hígado Graso (Bajo en Grasas Sat.)'
  ];

  const activityOptions = [
    { value: ActivityLevel.SEDENTARY, label: 'Sedentario', desc: 'Poco movimiento, trabajo de oficina.' },
    { value: ActivityLevel.LIGHT, label: 'Leve', desc: 'Caminatas diarias, deporte 1-2 días.' },
    { value: ActivityLevel.MODERATE, label: 'Moderado', desc: 'Deporte intenso 3-4 días por semana.' },
    { value: ActivityLevel.ACTIVE, label: 'Activo', desc: 'Entrenamiento diario o trabajo físico.' }
  ];

  return (
    <div className="max-w-md mx-auto px-6 py-12 min-h-screen flex flex-col bg-white relative">
      {/* Botón Volver (solo visible si ya hay un perfil creado) */}
      {initialProfile && (
        <button 
          onClick={onCancel}
          className="absolute top-6 left-4 p-3 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-all"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      <div className="flex-1 mt-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-black text-gray-900 mb-2">Paso {step} de 3</h1>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className={`h-full bg-blue-600 transition-all duration-500`} style={{ width: `${(step/3)*100}%` }}></div>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
            <div className="text-center mb-6">
              <Activity className="w-10 h-10 mx-auto text-blue-500 mb-2" />
              <h2 className="text-xl font-bold">Datos Físicos</h2>
              <p className="text-xs text-gray-400">Usaremos esto para calcular tus objetivos.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => setFormData({...formData, gender: Gender.MALE})} className={`p-4 rounded-2xl border-2 font-bold transition-all ${formData.gender === Gender.MALE ? 'border-black bg-black text-white' : 'border-gray-100 bg-gray-50'}`}>Hombre</button>
              <button type="button" onClick={() => setFormData({...formData, gender: Gender.FEMALE})} className={`p-4 rounded-2xl border-2 font-bold transition-all ${formData.gender === Gender.FEMALE ? 'border-black bg-black text-white' : 'border-gray-100 bg-gray-50'}`}>Mujer</button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Edad</label>
                <input 
                  type="number" 
                  value={formData.age === 0 ? '' : formData.age} 
                  onFocus={handleFocus}
                  onChange={e => setFormData({...formData, age: e.target.value === '' ? 0 : Number(e.target.value)})} 
                  className="w-full p-4 bg-gray-50 border-none rounded-xl font-bold focus:ring-2 focus:ring-black transition-all appearance-none" 
                  placeholder="Ej: 24"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Altura (cm)</label>
                  <input 
                    type="number" 
                    value={formData.height === 0 ? '' : formData.height} 
                    onFocus={handleFocus}
                    onChange={e => setFormData({...formData, height: e.target.value === '' ? 0 : Number(e.target.value)})} 
                    className="w-full p-4 bg-gray-50 border-none rounded-xl font-bold focus:ring-2 focus:ring-black transition-all appearance-none" 
                    placeholder="170"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Peso (kg)</label>
                  <input 
                    type="number" 
                    value={formData.weight === 0 ? '' : formData.weight} 
                    onFocus={handleFocus}
                    onChange={e => setFormData({...formData, weight: e.target.value === '' ? 0 : Number(e.target.value)})} 
                    className="w-full p-4 bg-gray-50 border-none rounded-xl font-bold focus:ring-2 focus:ring-black transition-all appearance-none" 
                    placeholder="70"
                  />
                </div>
              </div>
            </div>
            <button 
              onClick={nextStep} 
              disabled={!isStep1Valid}
              className="w-full py-5 bg-black text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-gray-200 disabled:opacity-20 transition-opacity"
            >
              Continuar <ChevronRight className="w-5 h-5"/>
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
            <div className="text-center mb-6">
              <Utensils className="w-10 h-10 mx-auto text-green-500 mb-2" />
              <h2 className="text-xl font-bold">Estilo de Vida</h2>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Nivel de Actividad</p>
              {activityOptions.map(opt => (
                <button key={opt.value} onClick={() => setFormData({...formData, activityLevel: opt.value})} className={`w-full p-4 rounded-xl border-2 text-left transition-all ${formData.activityLevel === opt.value ? 'border-black bg-black text-white shadow-lg shadow-black/20' : 'border-gray-100 bg-gray-50'}`}>
                  <p className="font-bold text-sm">{opt.label}</p>
                  <p className={`text-[10px] leading-tight ${formData.activityLevel === opt.value ? 'text-gray-300' : 'text-gray-400'}`}>{opt.desc}</p>
                </button>
              ))}
            </div>
            <div className="space-y-2 pt-2">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Tipo de Dieta</p>
              <div className="flex flex-wrap gap-2">
                {diets.map(d => (
                  <button key={d} type="button" onClick={() => setFormData({...formData, dietType: d})} className={`px-4 py-2 rounded-full border text-xs font-black transition-all ${formData.dietType === d ? 'bg-black text-white' : 'bg-gray-50 text-gray-600'}`}>{d}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={prevStep} className="flex-1 py-5 text-gray-400 font-bold">Atrás</button>
              <button onClick={nextStep} className="flex-[2] py-5 bg-black text-white font-bold rounded-2xl shadow-lg shadow-gray-200">Siguiente</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
            <div className="text-center mb-6">
              <ShieldAlert className="w-10 h-10 mx-auto text-red-500 mb-2" />
              <h2 className="text-xl font-bold">Restricciones Alimentarias</h2>
              <p className="text-xs text-gray-400 font-medium">Selecciona las condiciones que afectan tu alimentación.</p>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-[420px] overflow-y-auto pr-2 no-scrollbar pb-10">
              {conditions.map(c => (
                <button 
                  key={c} 
                  type="button" 
                  onClick={() => toggleCondition(c)} 
                  className={`p-4 rounded-xl border text-left flex justify-between items-center transition-all ${formData.healthConditions.includes(c) ? 'border-red-500 bg-red-50' : 'border-gray-100 bg-gray-50 hover:border-gray-300'}`}
                >
                  <span className="font-bold text-[13px]">{c}</span>
                  {formData.healthConditions.includes(c) && (
                    <div className="bg-red-500 p-1 rounded-full">
                      <ChevronRight className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-4 pt-4 bg-white/90 backdrop-blur sticky bottom-0">
              <button onClick={prevStep} className="flex-1 py-5 text-gray-400 font-bold">Atrás</button>
              <button onClick={handleSubmit} className="flex-[2] py-5 bg-black text-white font-bold rounded-2xl shadow-xl shadow-gray-200">Finalizar Perfil</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
