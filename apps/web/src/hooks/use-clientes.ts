import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { Cliente, CreateClienteInput, UpdateClienteInput } from '@gestao-financeira/shared';

export const useClientes = (page = 1, search?: string) => {
  return useQuery({
    queryKey: ['clientes', page, search],
    queryFn: async () => {
      const { data } = await apiClient.get('/clientes', {
        params: { page, pageSize: 10, search },
      });
      return data;
    },
  });
};

export const useClienteById = (id: string) => {
  return useQuery({
    queryKey: ['cliente', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/clientes/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useCreateCliente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateClienteInput) => {
      const { data } = await apiClient.post('/clientes', input);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });
};

export const useUpdateCliente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateClienteInput }) => {
      const response = await apiClient.put(`/clientes/${id}`, data);
      return response.data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['cliente', id] });
    },
  });
};

export const useDeleteCliente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/clientes/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });
};

export const useClienteContratos = (clienteId: string) => {
  return useQuery({
    queryKey: ['cliente-contratos', clienteId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/clientes/${clienteId}/contratos`);
      return data.data;
    },
    enabled: !!clienteId,
  });
};
