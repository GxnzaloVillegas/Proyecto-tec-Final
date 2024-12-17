// src/hooks/usePurchaseOrders.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPurchaseOrders, createPurchaseOrder, fetchPurchaseOrderById, updatePurchaseOrderStatus } from '../services/OrdenCompraService';
import api from '../services/api';

export const usePurchaseOrders = () => {
  return useQuery({
    queryKey: ['purchaseOrders'],
    queryFn: fetchPurchaseOrders,
  });
};

export const usePurchaseOrderById = (id) => {
  return useQuery({
    queryKey: ['purchaseOrder', id],
    queryFn: () => fetchPurchaseOrderById(id),
    enabled: !!id,
  });
};


// Crear una nueva orden de compra
export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData) => {
      const response = await api.post('/compras', orderData);
      return response.data;
    },
    onSuccess: () => {
      // Invalida los datos de compras después de crear una nueva orden
      queryClient.invalidateQueries('compras');
    },
  });
};
// Hook modificado para actualizar el estado de una orden sin usar mutate
export const useUpdatePurchaseOrderStatus = () => {
  const queryClient = useQueryClient();

  // Función directa para actualizar el estado de la orden
  const updateStatus = async (id, status) => {
    try {
      await updatePurchaseOrderStatus(id, status);
      
      // Invalida la cache de la orden específica y todas las órdenes
      queryClient.invalidateQueries(['purchaseOrders']);
      queryClient.invalidateQueries(['purchaseOrder', id]);
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error; // Propagar el error para manejo en el componente
    }
  };

  return { updateStatus };
};