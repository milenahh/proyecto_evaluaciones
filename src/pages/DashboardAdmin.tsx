import React from 'react';
import { Header } from '../components/Header';
import { StatCard } from '../components/StatCard';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

const DashboardAdmin: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="Panel Administrador" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Administracion de Plataforma</h2>
          <p className="text-gray-600 mt-2">Gestiona usuarios, asignaturas y evaluaciones</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Usuarios" value="0" color="blue" />
          <StatCard title="Total Asignaturas" value="0" color="green" />
          <StatCard title="Total Evaluaciones" value="0" color="purple" />
          <StatCard title="Evaluaciones Activas" value="0" color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Usuarios" footer={<Button label="Agregar Usuario" variant="primary" size="sm" />}>
            <p className="text-gray-600">No hay usuarios registrados</p>
          </Card>

          <Card title="Asignaturas" footer={<Button label="Crear Asignatura" variant="primary" size="sm" />}>
            <p className="text-gray-600">No hay asignaturas</p>
          </Card>

          <Card title="Evaluaciones" footer={<Button label="Ver Todas" variant="primary" size="sm" />}>
            <p className="text-gray-600">No hay evaluaciones</p>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DashboardAdmin;
