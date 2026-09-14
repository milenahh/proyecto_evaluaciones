import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import api from '../services/api';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'usuarios' | 'asignaturas' | 'relaciones'>('usuarios');
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [asignaturas, setAsignaturas] = useState<any[]>([]);
  const [docentes, setDocentes] = useState<any[]>([]);
  const [estudiantes, setEstudiantes] = useState<any[]>([]);

  const [formUsuario, setFormUsuario] = useState({ nombre_completo: '', apellido: '', email: '', contrasena: '', rol: 'estudiante' });
  const [formAsignatura, setFormAsignatura] = useState({ nombre: '', codigo: '', creditos: 3, semestre: 1 });
  const [formRelacion, setFormRelacion] = useState({ docente_id: '', asignatura_id: '' });
  const [formEstudianteAsig, setFormEstudianteAsig] = useState({ estudiante_id: '', asignatura_id: '' });
  
  const [editandoUsuario, setEditandoUsuario] = useState<any>(null);
  const [editandoAsignatura, setEditandoAsignatura] = useState<any>(null);
  const [asignaturaSeleccionada, setAsignaturaSeleccionada] = useState<any>(null);
  const [docentesAsignatura, setDocentesAsignatura] = useState<any[]>([]);
  const [estudiantesAsignatura, setEstudiantesAsignatura] = useState<any[]>([]);

  useEffect(() => {
    cargarDatos();
  }, [tab]);

  const cargarDatos = async () => {
    try {
      if (tab === 'usuarios') {
        const res = await api.get('/admin/usuarios');
        setUsuarios(res.data);
      } else if (tab === 'asignaturas') {
        const res = await api.get('/admin/asignaturas');
        setAsignaturas(res.data);
        const estRes = await api.get('/admin/usuarios?rol=estudiante');
        setEstudiantes(estRes.data);
      } else if (tab === 'relaciones') {
        const res1 = await api.get('/admin/usuarios?rol=docente');
        setDocentes(res1.data);
        const res2 = await api.get('/admin/asignaturas');
        setAsignaturas(res2.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const cargarDocentesAsignatura = async (asignaturaId: number) => {
    try {
      const res = await api.get(`/admin/asignaturas/${asignaturaId}/docentes`);
      setDocentesAsignatura(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const cargarEstudiantesAsignatura = async (asignaturaId: number) => {
    try {
      const res = await api.get(`/admin/asignaturas/${asignaturaId}/estudiantes`);
      setEstudiantesAsignatura(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCrearUsuario = async (e: any) => {
    e.preventDefault();
    try {
      await api.post('/admin/usuarios', formUsuario);
      setFormUsuario({ nombre_completo: '', apellido: '', email: '', contrasena: '', rol: 'estudiante' });
      await cargarDatos();
    } catch (e) {
      alert('Error');
    }
  };

  const handleEditarUsuario = async () => {
    try {
      await api.put(`/admin/usuarios/${editandoUsuario.id}`, editandoUsuario);
      setEditandoUsuario(null);
      await cargarDatos();
    } catch (e) {
      alert('Error');
    }
  };

  const handleEliminarUsuario = async (id: number) => {
    if (window.confirm('¿Eliminar este usuario?')) {
      try {
        await api.delete(`/admin/usuarios/${id}`);
        await cargarDatos();
      } catch (e) {
        alert('Error');
      }
    }
  };

  const handleCrearAsignatura = async (e: any) => {
    e.preventDefault();
    try {
      await api.post('/admin/asignaturas', formAsignatura);
      setFormAsignatura({ nombre: '', codigo: '', creditos: 3, semestre: 1 });
      await cargarDatos();
    } catch (e) {
      alert('Error');
    }
  };

  const handleEditarAsignatura = async () => {
    try {
      await api.put(`/admin/asignaturas/${editandoAsignatura.id}`, editandoAsignatura);
      setEditandoAsignatura(null);
      await cargarDatos();
    } catch (e) {
      alert('Error');
    }
  };

  const handleEliminarAsignatura = async (id: number) => {
    if (window.confirm('¿Eliminar esta asignatura?')) {
      try {
        await api.delete(`/admin/asignaturas/${id}`);
        await cargarDatos();
      } catch (e) {
        alert('Error');
      }
    }
  };

  const handleCrearRelacion = async (e: any) => {
    e.preventDefault();
    try {
      await api.post('/admin/docente-asignatura', formRelacion);
      setFormRelacion({ docente_id: '', asignatura_id: '' });
      alert('Relación creada');
      await cargarDatos();
    } catch (e) {
      alert('Error');
    }
  };

  const handleAsignarEstudiante = async (e: any) => {
    e.preventDefault();
    try {
      await api.post('/admin/estudiante-asignatura', { estudiante_id: formEstudianteAsig.estudiante_id, asignatura_id: asignaturaSeleccionada.id });
      setFormEstudianteAsig({ estudiante_id: '', asignatura_id: '' });
      await cargarEstudiantesAsignatura(asignaturaSeleccionada.id);
    } catch (e) {
      alert('Error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50"><Header />
      <div className="max-w-6xl mx-auto p-6">
        <button onClick={() => navigate('/')} className="mb-6 px-4 py-2 bg-gray-600 text-white rounded">← Atrás</button>
        <h1 className="text-3xl font-bold mb-8">Panel Administrador</h1>

        <div className="flex gap-4 mb-8">
          <button onClick={() => setTab('usuarios')} className={`px-4 py-2 rounded font-bold ${tab === 'usuarios' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>Usuarios</button>
          <button onClick={() => setTab('asignaturas')} className={`px-4 py-2 rounded font-bold ${tab === 'asignaturas' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>Asignaturas</button>
          <button onClick={() => setTab('relaciones')} className={`px-4 py-2 rounded font-bold ${tab === 'relaciones' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>Docente-Asignatura</button>
        </div>

        {tab === 'usuarios' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-2xl font-bold mb-4">Crear Usuario</h2>
              <form onSubmit={handleCrearUsuario} className="space-y-4">
                <div>
                  <label className="block font-bold mb-2">Nombre</label>
                  <input type="text" value={formUsuario.nombre_completo} onChange={(e) => setFormUsuario({...formUsuario, nombre_completo: e.target.value})} required className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block font-bold mb-2">Apellido</label>
                  <input type="text" value={formUsuario.apellido} onChange={(e) => setFormUsuario({...formUsuario, apellido: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block font-bold mb-2">Email</label>
                  <input type="email" value={formUsuario.email} onChange={(e) => setFormUsuario({...formUsuario, email: e.target.value})} required className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block font-bold mb-2">Contraseña</label>
                  <input type="password" value={formUsuario.contrasena} onChange={(e) => setFormUsuario({...formUsuario, contrasena: e.target.value})} required className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block font-bold mb-2">Rol</label>
                  <select value={formUsuario.rol} onChange={(e) => setFormUsuario({...formUsuario, rol: e.target.value})} className="w-full p-2 border rounded">
                    <option value="estudiante">Estudiante</option>
                    <option value="docente">Docente</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-green-600 text-white px-4 py-2 rounded font-bold">Crear</button>
              </form>
            </div>

            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-2xl font-bold mb-4">Usuarios ({usuarios.length})</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {usuarios.map(u => (
                  <div key={u.id} className="p-3 bg-gray-100 rounded flex justify-between items-center">
                    <div>
                      <p className="font-bold">{u.nombre_completo}</p>
                      <p className="text-sm text-gray-600">{u.email} - {u.rol}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditandoUsuario(u)} className="bg-blue-500 text-white px-2 py-1 rounded text-sm">Editar</button>
                      <button onClick={() => handleEliminarUsuario(u.id)} className="bg-red-600 text-white px-2 py-1 rounded text-sm">Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'asignaturas' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-2xl font-bold mb-4">Crear Asignatura</h2>
              <form onSubmit={handleCrearAsignatura} className="space-y-4">
                <div>
                  <label className="block font-bold mb-2">Nombre</label>
                  <input type="text" value={formAsignatura.nombre} onChange={(e) => setFormAsignatura({...formAsignatura, nombre: e.target.value})} required className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block font-bold mb-2">Código</label>
                  <input type="text" value={formAsignatura.codigo} onChange={(e) => setFormAsignatura({...formAsignatura, codigo: e.target.value})} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block font-bold mb-2">Créditos</label>
                  <input type="number" value={formAsignatura.creditos} onChange={(e) => setFormAsignatura({...formAsignatura, creditos: parseInt(e.target.value)})} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block font-bold mb-2">Semestre</label>
                  <input type="number" value={formAsignatura.semestre} onChange={(e) => setFormAsignatura({...formAsignatura, semestre: parseInt(e.target.value)})} className="w-full p-2 border rounded" />
                </div>
                <button type="submit" className="w-full bg-green-600 text-white px-4 py-2 rounded font-bold">Crear</button>
              </form>
            </div>

            <div className="bg-white p-6 rounded shadow">
              <h2 className="text-2xl font-bold mb-4">Asignaturas ({asignaturas.length})</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {asignaturas.map(a => (
                  <div key={a.id} className="p-3 bg-gray-100 rounded flex justify-between items-center cursor-pointer hover:bg-blue-100" onClick={() => { setAsignaturaSeleccionada(a); cargarDocentesAsignatura(a.id); cargarEstudiantesAsignatura(a.id); }}>
                    <div className="flex-1">
                      <p className="font-bold">{a.nombre}</p>
                      <p className="text-sm text-gray-600">{a.codigo} - {a.creditos} créditos - Sem {a.semestre}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); setEditandoAsignatura(a); }} className="bg-blue-500 text-white px-2 py-1 rounded text-sm">Editar</button>
                      <button onClick={(e) => { e.stopPropagation(); handleEliminarAsignatura(a.id); }} className="bg-red-600 text-white px-2 py-1 rounded text-sm">Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'relaciones' && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Relacionar Docente-Asignatura</h2>
            <form onSubmit={handleCrearRelacion} className="space-y-4 max-w-md">
              <div>
                <label className="block font-bold mb-2">Docente</label>
                <select value={formRelacion.docente_id} onChange={(e) => setFormRelacion({...formRelacion, docente_id: e.target.value})} required className="w-full p-2 border rounded">
                  <option value="">Selecciona docente</option>
                  {docentes.map(d => (
                    <option key={d.id} value={d.id}>{d.nombre_completo}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold mb-2">Asignatura</label>
                <select value={formRelacion.asignatura_id} onChange={(e) => setFormRelacion({...formRelacion, asignatura_id: e.target.value})} required className="w-full p-2 border rounded">
                  <option value="">Selecciona asignatura</option>
                  {asignaturas.map(a => (
                    <option key={a.id} value={a.id}>{a.nombre}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="w-full bg-green-600 text-white px-4 py-2 rounded font-bold">Relacionar</button>
            </form>
          </div>
        )}
      </div>

      {editandoUsuario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded shadow-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Editar Usuario</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block font-bold mb-2">Nombre</label>
                  <input type="text" value={editandoUsuario.nombre_completo} onChange={(e) => setEditandoUsuario({...editandoUsuario, nombre_completo: e.target.value})} className="w-full p-2 border rounded" />
                </div>

                <div>
                  <label className="block font-bold mb-2">Apellido</label>
                  <input type="text" value={editandoUsuario.apellido || ''} onChange={(e) => setEditandoUsuario({...editandoUsuario, apellido: e.target.value})} className="w-full p-2 border rounded" />
                </div>

                <div>
                  <label className="block font-bold mb-2">Email</label>
                  <input type="email" value={editandoUsuario.email} onChange={(e) => setEditandoUsuario({...editandoUsuario, email: e.target.value})} className="w-full p-2 border rounded" />
                </div>

                <div>
                  <label className="block font-bold mb-2">Contraseña (dejar en blanco para no cambiar)</label>
                  <input type="password" onChange={(e) => setEditandoUsuario({...editandoUsuario, contrasena: e.target.value})} className="w-full p-2 border rounded" />
                </div>

                <div>
                  <label className="block font-bold mb-2">Rol</label>
                  <select value={editandoUsuario.rol} onChange={(e) => setEditandoUsuario({...editandoUsuario, rol: e.target.value})} className="w-full p-2 border rounded">
                    <option value="estudiante">Estudiante</option>
                    <option value="docente">Docente</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button onClick={handleEditarUsuario} className="flex-1 bg-green-600 text-white px-4 py-2 rounded">Guardar</button>
                <button onClick={() => setEditandoUsuario(null)} className="flex-1 bg-gray-400 text-white px-4 py-2 rounded">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editandoAsignatura && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded shadow-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Editar Asignatura</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block font-bold mb-2">Nombre</label>
                  <input type="text" value={editandoAsignatura.nombre} onChange={(e) => setEditandoAsignatura({...editandoAsignatura, nombre: e.target.value})} className="w-full p-2 border rounded" />
                </div>

                <div>
                  <label className="block font-bold mb-2">Código</label>
                  <input type="text" value={editandoAsignatura.codigo} onChange={(e) => setEditandoAsignatura({...editandoAsignatura, codigo: e.target.value})} className="w-full p-2 border rounded" />
                </div>

                <div>
                  <label className="block font-bold mb-2">Créditos</label>
                  <input type="number" value={editandoAsignatura.creditos} onChange={(e) => setEditandoAsignatura({...editandoAsignatura, creditos: parseInt(e.target.value)})} className="w-full p-2 border rounded" />
                </div>

                <div>
                  <label className="block font-bold mb-2">Semestre</label>
                  <input type="number" value={editandoAsignatura.semestre} onChange={(e) => setEditandoAsignatura({...editandoAsignatura, semestre: parseInt(e.target.value)})} className="w-full p-2 border rounded" />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button onClick={handleEditarAsignatura} className="flex-1 bg-green-600 text-white px-4 py-2 rounded">Guardar</button>
                <button onClick={() => setEditandoAsignatura(null)} className="flex-1 bg-gray-400 text-white px-4 py-2 rounded">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {asignaturaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{asignaturaSeleccionada.nombre}</h2>
                <button onClick={() => setAsignaturaSeleccionada(null)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">{asignaturaSeleccionada.codigo}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="font-bold mb-2">Docentes Asignados ({docentesAsignatura.length})</p>
                  <div className="space-y-2">
                    {docentesAsignatura.map(d => (
                      <div key={d.id} className="p-2 bg-blue-100 rounded">
                        <p className="font-bold text-sm">{d.nombre_completo}</p>
                        <p className="text-xs text-gray-600">{d.email}</p>
                      </div>
                    ))}
                    {docentesAsignatura.length === 0 && (
                      <p className="text-gray-500 text-sm">Sin docentes</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="font-bold mb-2">Estudiantes Asignados ({estudiantesAsignatura.length})</p>
                  <div className="space-y-2">
                    {estudiantesAsignatura.map(e => (
                      <div key={e.id} className="p-2 bg-green-100 rounded">
                        <p className="font-bold text-sm">{e.nombre_completo}</p>
                        <p className="text-xs text-gray-600">{e.email}</p>
                      </div>
                    ))}
                    {estudiantesAsignatura.length === 0 && (
                      <p className="text-gray-500 text-sm">Sin estudiantes</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="font-bold mb-2">Asignar Estudiante</p>
                <form onSubmit={handleAsignarEstudiante} className="flex gap-2">
                  <select value={formEstudianteAsig.estudiante_id} onChange={(e) => setFormEstudianteAsig({...formEstudianteAsig, estudiante_id: e.target.value})} required className="flex-1 p-2 border rounded text-sm">
                    <option value="">Selecciona estudiante</option>
                    {estudiantes.map(e => (
                      <option key={e.id} value={e.id}>{e.nombre_completo}</option>
                    ))}
                  </select>
                  <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded text-sm font-bold">Agregar</button>
                </form>
              </div>

              <button onClick={() => setAsignaturaSeleccionada(null)} className="w-full bg-gray-400 text-white px-4 py-2 rounded">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
