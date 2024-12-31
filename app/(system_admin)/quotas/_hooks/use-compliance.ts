import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ComplianceWithRelations } from "../_types";

export const useComplianceRecords = (quotaId: string) => {
  return useQuery<ComplianceWithRelations[]>({
    queryKey: ["compliance", quotaId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/quotas/${quotaId}/compliance`);
      return data;
    },
  });
};

export const useCreateComplianceRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      quotaId,
      data,
    }: {
      quotaId: string;
      data: {
        violationType: string;
        description: string;
      };
    }) => {
      const response = await axios.post(`/api/quotas/${quotaId}/compliance`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["compliance", variables.quotaId] });
      queryClient.invalidateQueries({ queryKey: ["quota", variables.quotaId] });
    },
  });
};

export const useUpdateComplianceRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      quotaId,
      recordId,
      data,
    }: {
      quotaId: string;
      recordId: string;
      data: {
        status: "RESOLVED" | "DISMISSED" | "INVESTIGATING";
        resolution?: string;
      };
    }) => {
      const response = await axios.patch(`/api/quotas/${quotaId}/compliance`, {
        recordId,
        ...data,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["compliance", variables.quotaId] });
      queryClient.invalidateQueries({ queryKey: ["quota", variables.quotaId] });
    },
  });
};
