import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

interface Pregunta {
  id: string;
  enunciado: string;
  tipo: 'seleccion_multiple' | 'ensayo';
  opciones?: { id: string; texto: string }[];
}

const TomarEvaluacion: React.FC = () => {
  const { evaluacionId } = useParams();
  const navigate = useNavigate();
  const [preguntas] = useState<Pregunta[]>([]);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleRespuestaChange = (preguntaId: string, valor: string) => {
    setRespuestas((prev) => ({
      ...prev,
      [preguntaId]: valor,
    }));
  };

  const handleEnviar = async () => {
    setLoading(true);
    try {
      // Aqui se llamaria a la API para enviar respuestas
      console.log('Respuestas:', respuestas);
      navigate('/mis-evaluaciones');
    } catch (error) {
      console.error('Error al enviar evaluacion:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="Evaluacion" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {preguntas.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Cargando evaluacion...</p>
            </div>
          </Card>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Evaluacion</h2>
              <p className="text-gray-600 mt-2">Completa todas las preguntas</p>
            </div>

            <div className="space-y-6 mb-8">
              {preguntas.map((pregunta, index) => (
                <Card key={pregunta.id} title={`Pregunta ${index + 1}`}>
                  <p className="text-gray-900 font-semibold mb-4">{pregunta.enunciado}</p>
                  
                  {pregunta.tipo === 'seleccion_multiple' ? (
                    <div className="space-y-3">
                      {pregunta.opciones?.map((opcion) => (
                        <label key={opcion.id} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name={`pregunta-${pregunta.id}`}
                            value={opcion.id}
                            checked={respuestas[pregunta.id] === opcion.id}
                            onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)}
                            className="h-4 w-4"
                          />
                          <span className="text-gray-700">{opcion.texto}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      value={respuestas[pregunta.id] || ''}
                      onChange={(e) => handleRespuestaChange(pregunta.id, e.target.value)}
                      placeholder="Escribe tu respuesta aqui"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                      rows={5}
                    />
                  )}
                </Card>
              ))}
            </div>

            <div className="flex justify-between">
              <Button label="Cancelar" variant="secondary" onClick={() => navigate('/mis-evaluaciones')} />
              <Button label="Enviar Evaluacion" loading={loading} onClick={handleEnviar} />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default TomarEvaluacion;
