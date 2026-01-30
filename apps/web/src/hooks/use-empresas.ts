import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export function useEmpresas() {
    return useQuery({
        queryKey: ['empresas'],
        queryFn: async () => {
            const response = await apiClient.get('/empresas');
            return response.data;
        },
    });
}
