import { useState, useEffect } from 'react';

interface UseTimerReturn {
  tiempoRestante: number;
  porcentaje: number;
  tiempoFormato: string;
  estado: 'activo' | 'advertencia' | 'critico';
}

export const useTimer = (duracionMinutos: number, onTimeUp?: () => void): UseTimerReturn => {
  const [tiempoRestante, setTiempoRestante] = useState(duracionMinutos * 60);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(intervalo);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, [onTimeUp]);

  const minutos = Math.floor(tiempoRestante / 60);
  const segundos = tiempoRestante % 60;
  const tiempoFormato = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  
  const porcentaje = (tiempoRestante / (duracionMinutos * 60)) * 100;
  
  let estado: 'activo' | 'advertencia' | 'critico' = 'activo';
  if (porcentaje <= 25) estado = 'critico';
  else if (porcentaje <= 50) estado = 'advertencia';

  return { tiempoRestante, porcentaje, tiempoFormato, estado };
};
