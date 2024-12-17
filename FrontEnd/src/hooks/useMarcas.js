import { useQuery } from '@tanstack/react-query';
import { fetchBrands } from '../services/MarcaService';

export const useBrands = () => {
  return useQuery({
    queryKey: ['brands'],
    queryFn: fetchBrands,
  });
};
