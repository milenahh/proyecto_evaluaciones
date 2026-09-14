import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import api from '../services/api';

const DashboardEstudiante: React.FC = () => {
  const navigate = useNavigate();
  const [evals, setEvals] = useState<any[]>([]);
  const [respondidas, setRespondidas] = useState<number[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get('/evaluaciones');
        setEvals(data.data);
        for (const item of data.data) {
          const resp = await api.get(`/evaluaciones/${item.id}/mis-respuestas`);
          if (resp.data.length > 0) setRespondidas(prev => [...prev, item.id]);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50"><Header />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Mis Evaluaciones</h1>
        {evals.length === 0 ? (
          <p className="text-gray-500">No hay evaluaciones disponibles</p>
        ) : (
          evals.map((e) => (
            <div key={e.id} className="bg-white p-4 mb-4 rounded">
              <h3 className="font-bold">{e.titulo}</h3>
              <p className="text-sm text-gray-600">{e.descripcion}</p>
              {respondidas.includes(e.id) ? (
                <button disabled className="mt-4 bg-gray-400 text-white px-4 py-2 rounded">✓ Ya respondida</button>
              ) : (
                <button onClick={() => navigate(`/evaluacion/${e.id}`)} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Tomar</button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DashboardEstudiante;
