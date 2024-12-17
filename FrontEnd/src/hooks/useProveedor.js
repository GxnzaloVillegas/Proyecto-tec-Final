// src/hooks/useProveedores.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProveedores, createProveedor, updateProveedor, deleteProveedor } from '../services/ProveedorService';

// Hook para obtener todos los proveedores
export const useProveedores = () => {
  return useQuery({
    queryKey: ['proveedores'],
    queryFn: fetchProveedores,
  });
};

// Hook para crear un nuevo proveedor
export const useCreateProveedor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProveedor,
    onSuccess: () => {
      queryClient.invalidateQueries(['proveedores']);
    },
    onError: (error) => {
      console.error('Error creating provider:', error);
    },
  });
};

// Hook para actualizar un proveedor existente
export const useUpdateProveedor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => updateProveedor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['proveedores']);
    },
    onError: (error) => {
      console.error('Error updating provider:', error);
    },
  });
};

// Hook para eliminar un proveedor
export const useDeleteProveedor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteProveedor(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['proveedores']);
    },
    onError: (error) => {
      console.error('Error deleting provider:', error);
    },
  });
};
