
import React from 'react';
import { DailyLog, UserProfile } from '../scr/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowLeft, Target, Trophy } from 'lucide-react';
import { getFormattedDate } from '../scr/utils/calculations';

interface HistoryProps {
  logs: Record<string, DailyLog>;
  profile: UserProfile;
  onClose: () => void;
}

const History: React.FC<HistoryProps> = ({ logs, profile, onClose }) => {
  const chartData = (Object.entries(logs) as [string, DailyLog][])
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([date, log]) => ({
      date: getFormattedDate(date).split(' ')[0],
      fullDate: date,
      calories: log.meals.reduce((sum, m) => sum + m.calories, 0),
    }));

  return (
    <div className="max-w-md mx-auto px-6 py-10 animate-in fade-in slide-in-from-right duration-300 pb-40">
      <div className="flex items-center justify-between mb-10">
        <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl transition-all">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-black tracking-tight">Objetivos y Progreso</h2>
        <div className="w-10"></div>
      </div>

      <div className="bg-black text-white rounded-[2.5rem] p-8 mb-10 relative overflow-hidden">
        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4 opacity-70">
                <Target className="w-5 h-5"/>
                <span className="text-xs font-black uppercase tracking-[0.2em]">Meta Diaria</span>
            </div>
            <p className="text-4xl font-black mb-1">{profile.targetCalories} kcal</p>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Calculado para {profile.goal === 'LOSE' ? 'Bajar Grasa' : profile.goal === 'GAIN' ? 'Subir Músculo' : 'Mantener'}</p>
        </div>
        <div className="absolute -bottom-4 -right-4 opacity-20"><Trophy className="w-24 h-24" /></div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 mb-10">
        <h3 className="font-black text-gray-900 mb-6 flex items-center gap-2">Consumo Semanal</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 700}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 700}} />
              <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold' }} />
              <Bar dataKey="calories" radius={[8, 8, 8, 8]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.calories > profile.targetCalories ? '#f43f5e' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-black text-gray-900 px-2">Registro de Logros</h3>
        {[...(Object.entries(logs) as [string, DailyLog][])].reverse().slice(0, 10).map(([date, log]) => {
          const dayCals = log.meals.reduce((sum, m) => sum + m.calories, 0);
          const isSuccess = dayCals <= profile.targetCalories && dayCals > 0;
          return (
            <div key={date} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex justify-between items-center transition-all hover:scale-[1.02]">
              <div>
                <p className="font-black text-gray-900 text-sm uppercase tracking-tighter">{getFormattedDate(date)}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase">{log.meals.length} comidas</p>
              </div>
              <div className="text-right">
                <p className={`font-black text-lg ${dayCals > profile.targetCalories ? 'text-red-500' : 'text-green-500'}`}>
                  {dayCals} kcal
                </p>
                <div className="flex items-center justify-end gap-1">
                    {isSuccess ? <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> : <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>}
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{isSuccess ? 'Cumplido' : dayCals === 0 ? 'Sin Datos' : 'Excedido'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default History;
