import { useMutation } from '@tanstack/react-query';
import api from '../services/api';

export const useUploadProveedorFile = () => {
  const uploadFile = async (formData) => {
    console.log('FormData contents:', Object.fromEntries(formData.entries()));
    
    try {
      const response = await api.post('/compras/upload-ficha-tecnica', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Upload response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  };

  const mutation = useMutation({
    mutationFn: uploadFile,
    onError: (error) => {
      console.error('Error al subir el archivo:', error);
      throw error;
    }
  });

  return {
    uploadFile: mutation.mutateAsync,
    isUploading: mutation.isLoading,
    error: mutation.error
  };
};

// Si también necesitas manejar la subida de Excel
export const useExcelUpload = () => {
  const uploadExcel = async (formData) => {
    const response = await api.post('/compras/upload-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  };

  const mutation = useMutation({
    mutationFn: uploadExcel,
    onError: (error) => {
      console.error('Error al subir el Excel:', error);
      throw error;
    }
  });

  return {
    uploadExcel: mutation.mutateAsync,
    isUploading: mutation.isLoading,
    error: mutation.error
  };
}; 