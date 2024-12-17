import api from './api';

export const fetchSales = async () => {
  try {
    const response = await api.get('/ventas');
    console.log(response.data); // Asegúrate de revisar esto
    return response.data.ventas; // Accede a la propiedad correcta que contiene las ventas
  } catch (error) {
    console.error('Error fetching sales:', error);
    throw error;
  }
};

// Create a new sale
export const createSale = async (saleData) => {
  try {
    const response = await api.post('/ventas', saleData);
    return response.data;
  } catch (error) {
    console.error('Error creating sale:', error);
    throw error;
  }
};

// Fetch sale by ID
export const fetchSaleById = async (id) => {
  try {
    const response = await api.get(`/ventas/${id}`);
    return response.data.venta;
  } catch (error) {
    console.error(`Error fetching sale with ID ${id}:`, error);
    throw error;
  }
};
