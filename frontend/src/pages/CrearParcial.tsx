import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import api from '../services/api';

const CrearParcial: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    puntaje_total: 5,
    tiempo_limite_minutos: 60,
    asignatura_id: '',
    fecha_inicio: '',
    fecha_fin: '',
    contraseña: ''
  });
  const [asignaturas, setAsignaturas] = useState<any[]>([]);

  useEffect(() => {
    cargarAsignaturas();
  }, []);

  const cargarAsignaturas = async () => {
    try {
      const res = await api.get('/evaluaciones/asignaturas');
      setAsignaturas(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const res = await api.post('/evaluaciones', form);
      navigate(`/docente/parcial/${res.data.id}/preguntas`);
    } catch (e: any) {
      alert('Error: ' + e.response?.data?.error || e.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-2xl mx-auto p-6">
        <button onClick={() => navigate('/docente/dashboard')} className="mb-6 px-4 py-2 bg-gray-600 text-white rounded">← Atrás</button>
        
        <h1 className="text-3xl font-bold mb-8">Crear Parcial</h1>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow space-y-6">
          <div>
            <label className="block font-bold mb-2">Título</label>
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => setForm({...form, titulo: e.target.value})}
              required
              className="w-full p-3 border rounded"
            />
          </div>

          <div>
            <label className="block font-bold mb-2">Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm({...form, descripcion: e.target.value})}
              className="w-full p-3 border rounded h-24"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-2">Puntaje Total</label>
              <input
                type="number"
                max={5}
                value={form.puntaje_total}
                onChange={(e) => setForm({...form, puntaje_total: parseInt(e.target.value)})}
                className="w-full p-3 border rounded"
              />
            </div>

            <div>
              <label className="block font-bold mb-2">Tiempo (minutos)</label>
              <input
                type="number"
                value={form.tiempo_limite_minutos}
                onChange={(e) => setForm({...form, tiempo_limite_minutos: parseInt(e.target.value)})}
                className="w-full p-3 border rounded"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-2">Asignatura</label>
            <select
              value={form.asignatura_id}
              onChange={(e) => setForm({...form, asignatura_id: e.target.value})}
              required
              className="w-full p-3 border rounded"
            >
              <option value="">Selecciona asignatura</option>
              {asignaturas.map(a => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-2">Fecha Inicio</label>
              <input
                type="datetime-local"
                value={form.fecha_inicio}
                onChange={(e) => setForm({...form, fecha_inicio: e.target.value})}
                className="w-full p-3 border rounded"
              />
            </div>

            <div>
              <label className="block font-bold mb-2">Fecha Fin</label>
              <input
                type="datetime-local"
                value={form.fecha_fin}
                onChange={(e) => setForm({...form, fecha_fin: e.target.value})}
                className="w-full p-3 border rounded"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-2">Contraseña (opcional)</label>
            <input
              type="password"
              value={form.contraseña}
              onChange={(e) => setForm({...form, contraseña: e.target.value})}
              placeholder="Dejar vacío si no se requiere contraseña"
              className="w-full p-3 border rounded"
            />
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white px-4 py-3 rounded font-bold">
            Crear Parcial
          </button>
        </form>
      </div>
    </div>
  );
};

export default CrearParcial;
