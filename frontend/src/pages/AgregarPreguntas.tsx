import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import api from '../services/api';

const AgregarPreguntas: React.FC = () => {
  const { parcialId } = useParams();
  const navigate = useNavigate();
  const [parcial, setParcial] = useState<any>(null);
  const [preguntas, setPreguntas] = useState<any[]>([]);
  const [preguntaSeleccionada, setPreguntaSeleccionada] = useState<any>(null);
  const [editando, setEditando] = useState(false);
  const [editandoParcial, setEditandoParcial] = useState(false);
  const [loading, setLoading] = useState(false);

  const [enunciadoEdit, setEnunciadoEdit] = useState('');
  const [opcionesEdit, setOpcionesEdit] = useState<any[]>([]);

  const [formParcial, setFormParcial] = useState<any>({
    titulo: '',
    descripcion: '',
    puntaje_total: 0,
    tiempo_limite_minutos: 0,
    fecha_inicio: '',
    fecha_fin: '',
    contraseña: ''
  });

  const [form, setForm] = useState({
    enunciado: '',
    tipo: 'seleccion_multiple',
    opciones: [{ contenido: '', es_correcta: false }],
    puntaje: 0
  });

  useEffect(() => {
    cargarParcial();
  }, [parcialId]);

  const cargarParcial = async () => {
    try {
      const res = await api.get(`/evaluaciones/${parcialId}`);
      setParcial(res.data);
      setFormParcial({
        titulo: res.data.titulo,
        descripcion: res.data.descripcion,
        puntaje_total: res.data.puntaje_total,
        tiempo_limite_minutos: res.data.tiempo_limite_minutos,
        fecha_inicio: res.data.fecha_inicio,
        fecha_fin: res.data.fecha_fin,
        contraseña: ''
      });

      const pregRes = await api.get(`/evaluaciones/${parcialId}/preguntas`);
      setPreguntas(pregRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCrearPregunta = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        enunciado: form.enunciado,
        tipo: form.tipo,
        opciones: form.opciones
      };
      await api.post(`/evaluaciones/${parcialId}/preguntas`, payload);
      setForm({ enunciado: '', tipo: 'seleccion_multiple', opciones: [{ contenido: '', es_correcta: false }], puntaje: 0 });
      await cargarParcial();
    } catch (e) {
      alert('Error');
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarOpcion = () => {
    setForm({
      ...form,
      opciones: [...form.opciones, { contenido: '', es_correcta: false }]
    });
  };

  const handleOpcionChange = (idx: number, field: string, value: any) => {
    const newOpciones = [...form.opciones];
    newOpciones[idx] = { ...newOpciones[idx], [field]: value };
    setForm({ ...form, opciones: newOpciones });
  };

  const abrirEdicion = () => {
    setEnunciadoEdit(preguntaSeleccionada.enunciado);
    setOpcionesEdit(preguntaSeleccionada.opciones || []);
    setEditando(true);
  };

  const handleOpcionEditChange = (idx: number, field: string, value: any) => {
    const newOpciones = [...opcionesEdit];
    newOpciones[idx] = { ...newOpciones[idx], [field]: value };
    setOpcionesEdit(newOpciones);
  };

  const handleAgregarOpcionEdit = () => {
    setOpcionesEdit([...opcionesEdit, { contenido: '', es_correcta: false }]);
  };

  const handleEditarPregunta = async () => {
    try {
      const payload = {
        enunciado: enunciadoEdit,
        opciones: opcionesEdit
      };
      await api.put(`/evaluaciones/${parcialId}/preguntas/${preguntaSeleccionada.id}`, payload);
      setEditando(false);
      setPreguntaSeleccionada(null);
      await cargarParcial();
    } catch (e) {
      alert('Error');
    }
  };

  const handleEliminarPregunta = async () => {
    if (window.confirm('¿Eliminar pregunta?')) {
      try {
        await api.delete(`/evaluaciones/${parcialId}/preguntas/${preguntaSeleccionada.id}`);
        setPreguntaSeleccionada(null);
        await cargarParcial();
      } catch (e) {
        alert('Error');
      }
    }
  };

  const handleEditarParcial = async () => {
    try {
      const payload = {
        titulo: formParcial.titulo,
        descripcion: formParcial.descripcion,
        puntaje_total: formParcial.puntaje_total,
        tiempo_limite_minutos: formParcial.tiempo_limite_minutos,
        fecha_inicio: formParcial.fecha_inicio,
        fecha_fin: formParcial.fecha_fin
      };
      if (formParcial.contraseña) {
        (payload as any).contraseña = formParcial.contraseña;
      }
      await api.put(`/evaluaciones/${parcialId}`, payload);
      setEditandoParcial(false);
      await cargarParcial();
    } catch (e) {
      alert('Error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => navigate('/docente/dashboard')} className="px-4 py-2 bg-gray-600 text-white rounded">← Atrás</button>
          <h1 className="text-3xl font-bold">Agregar Preguntas al Parcial</h1>
          <button onClick={() => setEditandoParcial(true)} className="px-4 py-2 bg-blue-600 text-white rounded font-bold">Editar Parcial</button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Nueva Pregunta</h2>
            <form onSubmit={handleCrearPregunta} className="space-y-4">
              <div>
                <label className="block font-bold mb-2">Tipo</label>
                <select value={form.tipo} onChange={(e) => setForm({...form, tipo: e.target.value})} className="w-full p-2 border rounded">
                  <option value="seleccion_multiple">Selección Múltiple</option>
                  <option value="ensayo">Ensayo</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-2">Enunciado</label>
                <textarea value={form.enunciado} onChange={(e) => setForm({...form, enunciado: e.target.value})} required className="w-full p-2 border rounded h-20" />
              </div>

              {form.tipo === 'seleccion_multiple' && (
                <div>
                  <label className="block font-bold mb-2">Opciones</label>
                  {form.opciones.map((op, idx) => (
                    <div key={idx} className="mb-2 p-2 bg-gray-100 rounded">
                      <input type="text" value={op.contenido} onChange={(e) => handleOpcionChange(idx, 'contenido', e.target.value)} required placeholder="Opción" className="w-full p-2 border rounded mb-1" />
                      <label className="flex items-center">
                        <input type="checkbox" checked={op.es_correcta} onChange={(e) => handleOpcionChange(idx, 'es_correcta', e.target.checked)} className="mr-2" />
                        Opción correcta
                      </label>
                    </div>
                  ))}
                  <button type="button" onClick={handleAgregarOpcion} className="bg-blue-500 text-white px-4 py-2 rounded mb-4">+ Agregar Opción</button>
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full bg-green-600 text-white px-4 py-2 rounded font-bold">Crear Pregunta</button>
            </form>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Preguntas Agregadas ({preguntas.length})</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {preguntas.map((p) => (
                <div key={p.id} className="p-3 bg-gray-100 rounded cursor-pointer hover:bg-blue-100" onClick={() => setPreguntaSeleccionada(p)}>
                  <p className="font-bold">{p.enunciado}</p>
                  <p className="text-sm text-gray-600">{p.tipo === 'seleccion_multiple' ? `${p.opciones?.length || 0} opciones` : 'Pregunta abierta'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {preguntaSeleccionada && !editando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded shadow-lg max-w-2xl w-full max-h-80 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">Pregunta #{preguntaSeleccionada.orden}</h2>
                <button onClick={() => setPreguntaSeleccionada(null)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
              </div>

              <div className="mb-4">
                <p className="font-bold mb-2">Enunciado:</p>
                <p className="text-gray-800">{preguntaSeleccionada.enunciado}</p>
              </div>

              <div className="mb-4">
                <p className="font-bold mb-2">Tipo: {preguntaSeleccionada.tipo}</p>
              </div>

              {preguntaSeleccionada.tipo === 'seleccion_multiple' && (
                <div>
                  <p className="font-bold mb-2">Opciones:</p>
                  <div className="space-y-2">
                    {preguntaSeleccionada.opciones?.map((op: any) => (
                      <div key={op.id} className={`p-3 rounded ${op.es_correcta ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <p>{op.contenido}</p>
                        {op.es_correcta && <p className="text-green-700 text-sm font-bold">✓ Respuesta correcta</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-6">
                <button onClick={abrirEdicion} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded">Editar</button>
                <button onClick={handleEliminarPregunta} className="flex-1 bg-red-600 text-white px-4 py-2 rounded">Eliminar</button>
                <button onClick={() => setPreguntaSeleccionada(null)} className="flex-1 bg-gray-400 text-white px-4 py-2 rounded">Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {preguntaSeleccionada && editando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded shadow-lg max-w-2xl w-full max-h-80 overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Editar Pregunta</h2>
              
              <div className="mb-4">
                <label className="block font-bold mb-2">Enunciado</label>
                <textarea value={enunciadoEdit} onChange={(e) => setEnunciadoEdit(e.target.value)} className="w-full p-2 border rounded" rows={3} />
              </div>

              {preguntaSeleccionada.tipo === 'seleccion_multiple' && (
                <div>
                  <label className="block font-bold mb-2">Opciones</label>
                  {opcionesEdit.map((op, idx) => (
                    <div key={idx} className="mb-3 p-3 bg-gray-100 rounded">
                      <input type="text" value={op.contenido} onChange={(e) => handleOpcionEditChange(idx, 'contenido', e.target.value)} className="w-full p-2 border rounded mb-2" />
                      <label className="flex items-center">
                        <input type="checkbox" checked={op.es_correcta} onChange={(e) => handleOpcionEditChange(idx, 'es_correcta', e.target.checked)} className="mr-2" />
                        Opción correcta
                      </label>
                    </div>
                  ))}
                  <button type="button" onClick={handleAgregarOpcionEdit} className="bg-blue-500 text-white px-4 py-2 rounded mb-4">+ Agregar Opción</button>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={handleEditarPregunta} className="flex-1 bg-green-600 text-white px-4 py-2 rounded">Guardar</button>
                <button onClick={() => setEditando(false)} className="flex-1 bg-gray-400 text-white px-4 py-2 rounded">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editandoParcial && parcial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded shadow-lg max-w-2xl w-full">
            <div className="p-6 overflow-y-auto max-h-96">
              <h2 className="text-2xl font-bold mb-4">Editar Parcial</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block font-bold mb-2">Título</label>
                  <input type="text" value={formParcial.titulo} onChange={(e) => setFormParcial({...formParcial, titulo: e.target.value})} className="w-full p-2 border rounded" />
                </div>

                <div>
                  <label className="block font-bold mb-2">Descripción</label>
                  <textarea value={formParcial.descripcion} onChange={(e) => setFormParcial({...formParcial, descripcion: e.target.value})} className="w-full p-2 border rounded" rows={2} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-2">Puntaje Total</label>
                    <input type="number" value={formParcial.puntaje_total} onChange={(e) => setFormParcial({...formParcial, puntaje_total: parseInt(e.target.value)})} className="w-full p-2 border rounded" />
                  </div>
                  <div>
                    <label className="block font-bold mb-2">Tiempo (min)</label>
                    <input type="number" value={formParcial.tiempo_limite_minutos} onChange={(e) => setFormParcial({...formParcial, tiempo_limite_minutos: parseInt(e.target.value)})} className="w-full p-2 border rounded" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-2">Fecha de Inicio</label>
                  <input type="datetime-local" value={formParcial.fecha_inicio ? new Date(formParcial.fecha_inicio).toISOString().slice(0, 16) : ''} onChange={(e) => setFormParcial({...formParcial, fecha_inicio: e.target.value})} className="w-full p-2 border rounded" />
                </div>

                <div>
                  <label className="block font-bold mb-2">Fecha de Fin</label>
                  <input type="datetime-local" value={formParcial.fecha_fin ? new Date(formParcial.fecha_fin).toISOString().slice(0, 16) : ''} onChange={(e) => setFormParcial({...formParcial, fecha_fin: e.target.value})} className="w-full p-2 border rounded" />
                </div>

                <div>
                  <label className="block font-bold mb-2">Contraseña (opcional - dejar vacío para no cambiar)</label>
                  <input type="password" value={formParcial.contraseña} onChange={(e) => setFormParcial({...formParcial, contraseña: e.target.value})} placeholder="Nueva contraseña" className="w-full p-2 border rounded" />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button onClick={handleEditarParcial} className="flex-1 bg-green-600 text-white px-4 py-2 rounded">Guardar</button>
                <button onClick={() => setEditandoParcial(false)} className="flex-1 bg-gray-400 text-white px-4 py-2 rounded">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgregarPreguntas;
