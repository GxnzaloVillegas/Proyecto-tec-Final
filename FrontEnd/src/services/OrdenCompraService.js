import api from './api';

// Fetch all purchase orders
export const fetchPurchaseOrders = async () => {
  try {
    const response = await api.get('/compras');
    return response.data;
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    throw error;
  }
};

// Create a new purchase order
export const createPurchaseOrder = async (purchaseOrderData) => {
  try {
    const response = await api.post('/compras', purchaseOrderData);
    return response.data;
  } catch (error) {
    console.error('Error creating purchase order:', error);
    throw error;
  }
};

// services/OrdenCompraService.js
export const updatePurchaseOrderStatus = async (id, status) => {
  try {
    const response = await api.put(`/compras/${id}/estado`, { estado: status });
    return response.data;
  } catch (error) {
    console.error(`Error updating purchase order status for ID ${id}:`, error);
    throw error;
  }
};

// Fetch purchase order by ID
export const fetchPurchaseOrderById = async (id) => {
  try {
    const response = await api.get(`/compras/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching purchase order with ID ${id}:`, error);
    throw error;
  }
};
