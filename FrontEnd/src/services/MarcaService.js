import api from './api';

// Fetch all brands
export const fetchBrands = async () => {
  try {
    const response = await api.get('/marcas');
    return response.data;
  } catch (error) {
    console.error('Error fetching brands:', error);
    throw error;
  }
};
