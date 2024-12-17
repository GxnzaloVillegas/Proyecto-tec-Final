import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchClientes, createCliente, updateCliente, deleteCliente } from '../services/ClienteService';

// Hook para obtener todos los clientes
export const useClientes = () => {
  return useQuery({
    queryKey: ['clientes'],
    queryFn: fetchClientes,
  });
};

// Hook para crear un nuevo cliente
export const useCreateCliente = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCliente,
    onSuccess: () => {
      queryClient.invalidateQueries(['clientes']);
    },
  });
};

// Hook para actualizar un cliente existente
export const useUpdateCliente = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => updateCliente(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['clientes']);
    },
  });
};

// Hook para eliminar un cliente
export const useDeleteCliente = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteCliente(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['clientes']);
    },
    onError: (error) => {
      console.error('Error deleting client:', error);
    },
  });
};
