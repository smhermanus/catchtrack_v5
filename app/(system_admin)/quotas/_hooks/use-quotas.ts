import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { QuotaWithRelations, QuotaStats } from '../_types';

interface QuotasResponse {
  quotas: QuotaWithRelations[];
  total: number;
  pages: number;
}

interface UseQuotasOptions {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const useQuotas = (options: UseQuotasOptions = {}) => {
  const { search = '', status, page = 1, limit = 10 } = options;

  return useQuery<QuotasResponse>({
    queryKey: ['quotas', { search, status, page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const { data } = await axios.get(`/api/quotas?${params.toString()}`);
      return data;
    },
  });
};

export const useQuota = (id: number) => {
  return useQuery<QuotaWithRelations>({
    queryKey: ['quota', id],
    queryFn: async () => {
      const { data } = await axios.get(`/api/quotas/${id}`);
      return data;
    },
    enabled: !!id && typeof id === 'number',
  });
};

export const useLatestQuota = () => {
  return useQuery<QuotaWithRelations>({
    queryKey: ['quota', 'latest'],
    queryFn: async () => {
      const { data } = await axios.get('/api/quotas/latest');
      return data;
    },
  });
};

export const useQuotaStats = () => {
  return useQuery<QuotaStats>({
    queryKey: ['quota-stats'],
    queryFn: async () => {
      const { data } = await axios.get('/api/quotas/stats');
      return data;
    },
  });
};

export const useCreateQuota = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post('/api/quotas', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotas'] });
      queryClient.invalidateQueries({ queryKey: ['quota-stats'] });
    },
  });
};

export const useUpdateQuota = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await axios.patch(`/api/quotas/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quotas'] });
      queryClient.invalidateQueries({ queryKey: ['quota', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['quota-stats'] });
    },
  });
};

export const useDeleteQuota = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`/api/quotas/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotas'] });
      queryClient.invalidateQueries({ queryKey: ['quota-stats'] });
    },
  });
};
