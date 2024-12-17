// src/services/ProveedorService.js
import api from './api';

// Obtener todos los proveedores
export const fetchProveedores = async () => {
  try {
    const response = await api.get('/proveedores');
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching providers:', error);
    throw error;
  }
};

// Crear un nuevo proveedor
export const createProveedor = async (proveedorData) => {
  try {
    const response = await api.post('/proveedores', proveedorData);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating provider:', error);
    throw error;
  }
};

// Actualizar un proveedor existente
export const updateProveedor = async (id, proveedorData) => {
  try {
    const response = await api.put(`/proveedores/${id}`, proveedorData);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating provider:', error);
    throw error;
  }
};

// Eliminar un proveedor
export const deleteProveedor = async (id) => {
  try {
    const response = await api.delete(`/proveedores/${id}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting provider:', error);
    throw error;
  }
};
