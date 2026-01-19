import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export const useDashboardResumo = (mes?: number, ano?: number) => {
  return useQuery({
    queryKey: ['dashboard-resumo', mes, ano],
    queryFn: async () => {
      const { data } = await apiClient.get('/dashboard/resumo-mensal', {
        params: { mes, ano },
      });
      return data.data;
    },
  });
};

export const useDashboardResumoGeral = () => {
  return useQuery({
    queryKey: ['dashboard-resumo-geral'],
    queryFn: async () => {
      const { data } = await apiClient.get('/dashboard/resumo-geral');
      return data.data;
    },
  });
};

export const useDashboardProximosVencimentos = (dias = 7) => {
  return useQuery({
    queryKey: ['dashboard-proximos-vencimentos', dias],
    queryFn: async () => {
      const { data } = await apiClient.get('/dashboard/proximos-vencimentos', {
        params: { dias },
      });
      return data.data;
    },
  });
};

export const useDashboardAtrasados = () => {
  return useQuery({
    queryKey: ['dashboard-atrasados'],
    queryFn: async () => {
      const { data } = await apiClient.get('/dashboard/atrasados');
      return data.data;
    },
  });
};

export const useDashboardGraficoMensal = (ano?: number) => {
  return useQuery({
    queryKey: ['dashboard-grafico-mensal', ano],
    queryFn: async () => {
      const { data } = await apiClient.get('/dashboard/grafico-mensal', {
        params: { ano },
      });
      return data.data;
    },
  });
};
