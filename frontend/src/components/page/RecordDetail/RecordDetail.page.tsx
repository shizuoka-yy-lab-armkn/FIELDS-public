import { WithRecordSelectableHeader } from "@/components/layout/WithRecordSelectableHeader";
import { LoadingPane } from "@/components/util/LoadingPane";
import { useGetRecordDetail, useRouterRecordId } from "@/hooks/records";
import { getPageTitle } from "@/usecase/pagemeta";
import { fmtRecordName } from "@/usecase/records";
import Head from "next/head";
import { useMemo } from "react";
import { RecordDetail } from "./RecordDetail";

export const RecordDetailPage = () => {
  const recordId = useRouterRecordId();
  const { record, subject, segs, jobProgressPercentage } = useGetRecordDetail(recordId);

  const title = useMemo(() => {
    if (record == null) return getPageTitle("読み込み中");
    return getPageTitle(fmtRecordName(record));
  }, [record]);

  return (
    <WithRecordSelectableHeader>
      <Head>
        <title>{title}</title>
      </Head>
      {(record == null || subject == null || jobProgressPercentage == null)
        ? <LoadingPane />
        : (
          <RecordDetail
            record={record}
            subject={subject}
            jobProgressPercentage={jobProgressPercentage}
            segs={segs}
          />
        )}
    </WithRecordSelectableHeader>
  );
};
