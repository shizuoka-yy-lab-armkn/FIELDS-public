import * as client from "@/gen/oapi/backend/v1/client/exemplar-videos/exemplar-videos";
import { RecordSegmentAggrLite } from "@/model/RecordSegmentAggr";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { useGetSubject } from "./subjects";

/**
 * URL から recordId を取得
 * URL ルーティングパスに [recordId] が含まれていないページでは undefined になるので注意
 */
export const useRouterExemplarVideoId = (): string => {
  const r = useRouter();
  return r.query.exemplarVideoId as string;
};

export const useGetExemplarVideoList = () => {
  const { data: exemplars } = client.useGetExemplarVideoList({
    query: { staleTime: 1000 * 60 },
  });
  return { exemplars };
};

export const useGetExemplarVideoDetail = (exemplarVideoId: string) => {
  const { data: exemplar } = client.useGetExemplarVideo(exemplarVideoId);
  const { subject } = useGetSubject(exemplar?.subject.id);

  const segs = useMemo((): RecordSegmentAggrLite[] => {
    if (exemplar == null || subject == null) {
      return [];
    }

    const dic = Object.fromEntries(subject.actions.map((a) => [a.id, a]));

    return exemplar.segs.map(s => {
      return new RecordSegmentAggrLite(s, dic[s.opstepId]!, exemplar.fps);
    });
  }, [exemplar, subject]);

  return { exemplar, subject, segs };
};
