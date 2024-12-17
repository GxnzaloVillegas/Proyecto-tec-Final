import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSales, fetchSaleById } from '../services/VentaService';
import api from '../services/api';

export const useSales = () => {
  return useQuery({
    queryKey: ['sales'],
    queryFn: fetchSales,
  });
};

export const useSaleById = (id) => {
  return useQuery({
    queryKey: ['sale', id],
    queryFn: () => fetchSaleById(id),
    enabled: !!id,
  });
};

// Crear una nueva venta
export const useCreateVenta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (saleData) => {
      const response = await api.post('/ventas', saleData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries('sales');
    },
  });
};
