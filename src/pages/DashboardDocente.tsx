import React from 'react';
import { Header } from '../components/Header';
import { StatCard } from '../components/StatCard';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

const DashboardDocente: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="Panel Docente" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Panel Docente</h2>
          <p className="text-gray-600 mt-2">Administra tus evaluaciones y visualiza el desempenio de estudiantes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Evaluaciones Creadas" value="0" color="blue" />
          <StatCard title="Evaluaciones Activas" value="0" color="green" />
          <StatCard title="Estudiantes" value="0" color="purple" />
          <StatCard title="Pendientes de Calificar" value="0" color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Mis Evaluaciones" footer={<Button label="Crear Evaluacion" variant="primary" size="sm" />}>
            <p className="text-gray-600">No hay evaluaciones creadas</p>
          </Card>

          <Card title="Mis Asignaturas">
            <p className="text-gray-600">No hay asignaturas asignadas</p>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DashboardDocente;
