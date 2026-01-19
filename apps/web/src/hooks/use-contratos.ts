import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { Contrato, CreateContratoInput, UpdateContratoInput } from '@gestao-financeira/shared';

export const useContratos = (page = 1, clienteId?: string, status?: string) => {
  return useQuery({
    queryKey: ['contratos', page, clienteId, status],
    queryFn: async () => {
      const { data } = await apiClient.get('/contratos', {
        params: { page, pageSize: 10, clienteId, status },
      });
      return data;
    },
  });
};

export const useContratoById = (id: string) => {
  return useQuery({
    queryKey: ['contrato', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/contratos/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useCreateContrato = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateContratoInput) => {
      const { data } = await apiClient.post('/contratos', input);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
    },
  });
};

export const useUpdateContrato = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateContratoInput }) => {
      const response = await apiClient.put(`/contratos/${id}`, data);
      return response.data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      queryClient.invalidateQueries({ queryKey: ['contrato', id] });
    },
  });
};

export const useDeleteContrato = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/contratos/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
    },
  });
};

export const useRegerarParcelas = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contratoId: string) => {
      const { data } = await apiClient.post(`/contratos/${contratoId}/gerar-parcelas`);
      return data.data;
    },
    onSuccess: (_, contratoId) => {
      queryClient.invalidateQueries({ queryKey: ['contrato', contratoId] });
      queryClient.invalidateQueries({ queryKey: ['parcelas'] });
    },
  });
};
