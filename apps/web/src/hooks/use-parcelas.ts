import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { UpdateParcelaInput, MarcarPagoInput } from '@gestao-financeira/shared';

export const useParcelas = (page = 1, filters?: { status?: string; mes?: number; ano?: number }) => {
  return useQuery({
    queryKey: ['parcelas', page, filters],
    queryFn: async () => {
      const { data } = await apiClient.get('/parcelas', {
        params: { page, pageSize: 10, ...filters },
      });
      return data;
    },
  });
};

export const useParcelaById = (id: string) => {
  return useQuery({
    queryKey: ['parcela', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/parcelas/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useUpdateParcela = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateParcelaInput }) => {
      const response = await apiClient.put(`/parcelas/${id}`, data);
      return response.data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['parcelas'] });
      queryClient.invalidateQueries({ queryKey: ['parcela', id] });
    },
  });
};

export const useMarcarPago = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: MarcarPagoInput }) => {
      const response = await apiClient.post(`/parcelas/${id}/pagar`, data);
      return response.data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['parcelas'] });
      queryClient.invalidateQueries({ queryKey: ['parcela', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useParcelasAtrasadas = () => {
  return useQuery({
    queryKey: ['parcelas-atrasadas'],
    queryFn: async () => {
      const { data } = await apiClient.get('/parcelas/atrasadas');
      return data.data;
    },
  });
};

export const useProximasVencimentos = (dias = 7) => {
  return useQuery({
    queryKey: ['proximas-vencimentos', dias],
    queryFn: async () => {
      const { data } = await apiClient.get('/parcelas/proximas-vencer', {
        params: { dias },
      });
      return data.data;
    },
  });
};
