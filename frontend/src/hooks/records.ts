import * as client from "@/gen/oapi/backend/v1/client/records/records";
import { RecordSegmentAggr } from "@/model/RecordSegmentAggr";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { useGetSubject } from "./subjects";

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
      refetchInterval: (query): number | false => {
        const progress = query.state.data?.jobProgressPercentage ?? 0;
        return progress < 100 && 1500;
      },
    },
  });
  return { evaluation, isLoading, isError };
};

export const useGetRecordDetail = (recordId: string) => {
  const { record } = useGetRecord(recordId);
  const { subject } = useGetSubject(record?.subjectId);
  const { evaluation } = useGetEvaluation(recordId);

  const segs = useMemo((): RecordSegmentAggr[] => {
    if (record == null || subject == null || evaluation == null) {
      return [];
    }

    const dic = Object.fromEntries(subject.actions.map((a) => [a.id, a]));

    return evaluation.segs.map(s => {
      return new RecordSegmentAggr(s, dic[s.actionId]!, record.foreheadVideoFps);
    });
  }, [record, subject, evaluation]);

  const jobProgressPercentage = evaluation?.jobProgressPercentage;

  return { record, subject, segs, jobProgressPercentage };
};
