import React from 'react';
import Header from '../components/Header';

const ListarEvaluacionesEstudiante: React.FC = () => {
  return (
    <div>
      <Header />
      <div className="p-6">
        <h1 className="text-3xl font-bold">Mis Evaluaciones</h1>
      </div>
    </div>
  );
};

export default ListarEvaluacionesEstudiante;
