import React from 'react';

interface TimerProps {
  tiempoFormato: string;
  porcentaje: number;
  estado: 'activo' | 'advertencia' | 'critico';
}

export const Timer: React.FC<TimerProps> = ({ tiempoFormato, porcentaje, estado }) => {
  const getColorClasses = () => {
    switch (estado) {
      case 'activo':
        return 'bg-green-500';
      case 'advertencia':
        return 'bg-yellow-500';
      case 'critico':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTextColor = () => {
    switch (estado) {
      case 'activo':
        return 'text-green-700';
      case 'advertencia':
        return 'text-yellow-700';
      case 'critico':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">Tiempo restante</p>
          <p className={`text-3xl font-bold ${getTextColor()}`}>{tiempoFormato}</p>
        </div>
        <div className="w-24 h-24">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${(porcentaje / 100) * 283} 283`}
              className={`transition-all duration-1000 ${getColorClasses()}`}
            />
          </svg>
          <p className="text-center text-xs text-gray-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {Math.round(porcentaje)}%
          </p>
        </div>
      </div>
    </div>
  );
};
