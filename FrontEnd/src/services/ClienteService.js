import api from './api';

// Obtener todos los clientes
export const fetchClientes = async () => {
  try {
    const response = await api.get('/clientes');
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
};

// Crear un nuevo cliente
export const createCliente = async (clienteData) => {
  try {
    const response = await api.post('/clientes', clienteData);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating client:', error);
    throw error;
  }
};

// Actualizar un cliente existente
export const updateCliente = async (id, clienteData) => {
  try {
    const response = await api.put(`/clientes/${id}`, clienteData);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating client:', error);
    throw error;
  }
};

// Eliminar un cliente
export const deleteCliente = async (id) => {
  try {
    const response = await api.delete(`/clientes/${id}`);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
};
