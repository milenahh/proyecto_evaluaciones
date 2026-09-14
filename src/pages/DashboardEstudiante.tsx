import React from 'react';
import { Header } from '../components/Header';
import { StatCard } from '../components/StatCard';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

const DashboardEstudiante: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="Dashboard Estudiante" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Mis Evaluaciones</h2>
          <p className="text-gray-600 mt-2">Consulta tus evaluaciones disponibles y calificaciones</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Evaluaciones Disponibles" value="0" color="blue" />
          <StatCard title="Evaluaciones Completadas" value="0" color="green" />
          <StatCard title="Promedio General" value="-" color="purple" />
        </div>

        <Card title="Evaluaciones Activas">
          <p className="text-gray-600">No hay evaluaciones disponibles en este momento</p>
        </Card>
      </main>
    </div>
  );
};

export default DashboardEstudiante;
