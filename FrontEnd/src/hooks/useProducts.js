// src/hooks/useProducts.js
import { useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {createProduct, fetchProducts, fetchProductsByInventory, updateProduct, deleteProduct} from '../services/ProductService';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
};

export const useProductsByInventory = (ubicacionId) => {
  return useQuery({
    queryKey: ['productsByInventory', ubicacionId],
    queryFn: () => fetchProductsByInventory(ubicacionId),
    enabled: !!ubicacionId, // Solo ejecuta la consulta si ubicacionId es verdadero
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, productData }) => {
      const response = await updateProduct(id, productData);
      return response;
    },
    onSuccess: () => {
      // Invalidate 'products' query to refresh the product list after updating
      queryClient.invalidateQueries('products');
    },
    onError: (error) => {
      console.error('Error updating product:', error);
    },
  });
};
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData) => {
      const response = await createProduct(productData);
      return response;
    },
    onSuccess: () => {
      // Invalidate 'products' query to refresh the product list after adding a new product
      queryClient.invalidateQueries('products');
    },
    onError: (error) => {
      console.error('Error creating product:', error);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await deleteProduct(id);
      return response;
    },
    onSuccess: () => {
      // Invalidate 'products' query to refresh the product list after deletion
      queryClient.invalidateQueries('products');
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
    },
  });
};