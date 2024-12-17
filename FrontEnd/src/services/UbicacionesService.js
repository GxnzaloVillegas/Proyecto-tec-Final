// src/services/ubicacionService.js
import api from './api';

// Obtener todas las ubicaciones
export const fetchUbicaciones = async () => {
  try {
    const response = await api.get('/ubicaciones');
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }
};

// Crear una nueva ubicación
export const createUbicacion = async (ubicacionData) => {
  try {
    const response = await api.post('/ubicaciones', ubicacionData);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating location:', error);
    throw error;
  }
};

// Actualizar una ubicación existente
export const updateUbicacion = async (id, ubicacionData) => {
  try {
    const response = await api.put(`/ubicaciones/${id}`, ubicacionData);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating location:', error);
    throw error;
  }
};

// Eliminar una ubicación
export const deleteUbicacion = async (id) => {
  try {
    const response = await api.delete(`/ubicaciones/${id}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting location:', error);
    throw error;
  }
};

export const getDetallesUbicacion = async (id) => {
  try {
    const response = await api.get(`/ubicaciones/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching location details:', error);
    throw error;
  }
};
