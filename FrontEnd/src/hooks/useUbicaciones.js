// src/hooks/useUbicaciones.js
import api from '../services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUbicaciones, createUbicacion, updateUbicacion, deleteUbicacion, getDetallesUbicacion } from '../services/UbicacionesService';

// Hook para obtener todas las ubicaciones
export const useUbicaciones = () => {
  return useQuery({
    queryKey: ['ubicaciones'],
    queryFn: fetchUbicaciones,
  });
};

// Hook para crear una nueva ubicación
export const useCreateUbicacion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUbicacion,
    onSuccess: () => {
      queryClient.invalidateQueries(['ubicaciones']);
    },
    onError: (error) => {
      console.error('Error creating location:', error);
    },
  });
};

// Hook para actualizar una ubicación existente
export const useUpdateUbicacion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => updateUbicacion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['ubicaciones']);
    },
    onError: (error) => {
      console.error('Error updating location:', error);
    },
  });
};

// Hook para eliminar una ubicación
export const useDeleteUbicacion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteUbicacion(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['ubicaciones']);
    },
    onError: (error) => {
      console.error('Error deleting location:', error);
    },
  });
};

// Hook para obtener detalles de una ubicación específica
export const useDetallesUbicacion = (id) => {
  return useQuery({
    queryKey: ['ubicacion', id],
    queryFn: () => getDetallesUbicacion(id),
    enabled: !!id,
  });
};

export const useUbicacionesConProductos = () => {
  return useQuery({
    queryKey: ['ubicacionesConProductos'],
    queryFn: async () => {
      const response = await api.get('/ubicaciones/con-productos');
      return response.data;
    },
  });
};
