import { useEffect, useState } from 'react';

interface UseAutoSaveReturn {
  guardando: boolean;
  guardado: boolean;
  error: string | null;
}

export const useAutoSave = (
  datos: Record<string, string>,
  intervaloMs: number = 30000,
  onSave?: (datos: Record<string, string>) => Promise<void>
): UseAutoSaveReturn => {
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const intervalo = setInterval(async () => {
      try {
        setGuardando(true);
        setError(null);
        if (onSave) {
          await onSave(datos);
        }
        setGuardado(true);
        setTimeout(() => setGuardado(false), 2000);
      } catch (err) {
        setError('Error al guardar');
      } finally {
        setGuardando(false);
      }
    }, intervaloMs);

    return () => clearInterval(intervalo);
  }, [datos, intervaloMs, onSave]);

  return { guardando, guardado, error };
};
