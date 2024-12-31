import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { CatchRecordWithRelations } from "../_types";

export const useCatchRecords = (quotaId: string) => {
  return useQuery<CatchRecordWithRelations[]>({
    queryKey: ["catch-records", quotaId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/quotas/${quotaId}/catch-records`);
      return data;
    },
  });
};
