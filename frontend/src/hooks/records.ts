import * as client from "@/gen/oapi/backend/v1/client/records/records";
import { useRouter } from "next/router";

/**
 * URL から recordId を取得
 * URL ルーティングパスに [recordId] が含まれていないページでは undefined になるので注意
 */
export const useRouterRecordId = (): string => {
  const r = useRouter();
  return r.query.recordId as string;
};

export const useGetRecordList = () => {
  const { data: records, isLoading, isError } = client.useGetRecordList({
    query: {
      staleTime: 1000 * 60,
    },
  });
  return { records, isLoading, isError };
};

export const useGetRecord = (recordId: string | undefined) => {
  const { data: record, isLoading, isError } = client.useGetRecord(recordId ?? "", {
    query: {
      staleTime: Infinity,
    },
  });
  return { record, isLoading, isError };
};

export const useGetEvaluation = (recordId: string | undefined) => {
  const { data: evaluation, isLoading, isError } = client.useGetRecordEvaluation(recordId ?? "", {
    query: {
      staleTime: Infinity,
    },
  });
  return { evaluation, isLoading, isError };
};
