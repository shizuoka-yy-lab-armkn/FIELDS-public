import { useRouter } from "next/router";

/**
 * URL から recordId を取得
 * URL ルーティングパスに [recordId] が含まれていないページでは undefined になるので注意
 */
export const useRouterRecordId = (): string => {
  const r = useRouter();
  return r.query.recordId as string;
};
