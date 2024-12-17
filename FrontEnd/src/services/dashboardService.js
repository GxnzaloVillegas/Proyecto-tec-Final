import api from './api';

export const fetchTopSellingProducts = async (category, brand, startDate, endDate) => {
  try {
    const response = await api.get('/dashboard/top-selling-products', {
      params: { category, brand, startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching top selling products:', error);
    throw error;
  }
};

export const fetchSalesSummary = async () => {
  try {
    const response = await api.get('/dashboard/sales-summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching sales summary:', error);
    throw error;
  }
};

export const fetchLowStockProducts = async () => {
  try {
    const response = await api.get('/dashboard/low-stock-products');
    return response.data;
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    throw error;
  }
};
