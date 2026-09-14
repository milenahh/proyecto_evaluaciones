import api from './api';

export const getEvaluaciones = async () => {
  const response = await api.get('/evaluaciones');
  return response.data;
};
