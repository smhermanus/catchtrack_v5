import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { TransferWithRelations } from '../_types';

export const useTransfers = (quotaId: string) => {
  return useQuery<TransferWithRelations[]>({
    queryKey: ['transfers', quotaId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/quotas/${quotaId}/transfers`);
      return data;
    },
  });
};

export const useCreateTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      quotaId,
      data,
    }: {
      quotaId: string;
      data: {
        destinationQuotaId: string;
        amount: number;
        reason: string;
      };
    }) => {
      const response = await axios.post(`/api/quotas/${quotaId}/transfer`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transfers', variables.quotaId] });
      queryClient.invalidateQueries({ queryKey: ['quota', variables.quotaId] });
    },
  });
};

export const useUpdateTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      quotaId,
      transferId,
      data,
    }: {
      quotaId: string;
      transferId: string;
      data: {
        status: 'APPROVED' | 'REJECTED';
        rejectionReason?: string;
      };
    }) => {
      const response = await axios.patch(`/api/quotas/${quotaId}/transfer`, {
        transferId,
        ...data,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transfers', variables.quotaId] });
      queryClient.invalidateQueries({ queryKey: ['quota', variables.quotaId] });
    },
  });
};
