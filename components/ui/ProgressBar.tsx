
import React from 'react';

interface ProgressBarProps {
  label: string;
  current: number;
  max: number;
  color: string;
  unit?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ label, current, max, color, unit = 'g' }) => {
  const safeMax = max > 0 ? max : 1; // Evitar división por cero
  const percentage = Math.min(100, (current / safeMax) * 100);

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs font-medium mb-1">
        <span className="text-gray-500 uppercase tracking-wider">{label}</span>
        <span className="text-gray-900 font-bold">{current}{unit} / {max}{unit}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${color}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
