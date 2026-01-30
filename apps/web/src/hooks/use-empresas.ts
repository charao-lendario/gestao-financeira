import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export function useEmpresas() {
    return useQuery({
        queryKey: ['empresas'],
        queryFn: async () => {
            const response = await api.get('/empresas');
            return response.data;
        },
    });
}
