import api from './api';

// Fetch all products
export const fetchProducts = async () => {
  try {
    const response = await api.get('/productos');
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error; // Re-throw the error so it can be handled by the caller
  }
};

// Fetch product by ID
export const fetchProductById = async (id) => {
  try {
    const response = await api.get(`/productos/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw error;
  }
};

// Update product by ID
export const updateProduct = async (id, productData) => {
  try {
    const response = await api.put(`/productos/${id}`, productData);
    return response.data;
  } catch (error) {
    console.error(`Error updating product with ID ${id}:`, error);
    throw error;
  }
};

// Fetch products by inventory location
export const fetchProductsByInventory = async (ubicacionId) => {
  try {
    const response = await api.get(`/inventarios/${ubicacionId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching products for inventory location ID ${ubicacionId}:`, error);
    throw error;
  }
};
export const createProduct = async (productData) => {
  try {
    const response = await api.post('/productos', productData);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// Delete product by ID
export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/productos/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting product with ID ${id}:`, error);
    throw error;
  }
};
