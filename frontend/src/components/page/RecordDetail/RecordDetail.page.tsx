import { WithRecordSelectableHeader } from "@/components/layout/WithRecordSelectableHeader";
import { LoadingPane } from "@/components/util/LoadingPane";
import { useGetEvaluation, useGetRecord, useRouterRecordId } from "@/hooks/records";
import { useGetSubject } from "@/hooks/subjects";
import { getPageTitle } from "@/usecase/pagemeta";
import { fmtRecordName } from "@/usecase/records";
import Head from "next/head";
import { useMemo } from "react";
import { RecordDetail } from "./RecordDetail";

export const RecordDetailPage = () => {
  const recordId = useRouterRecordId();
  const { record } = useGetRecord(recordId);
  const { subject } = useGetSubject(record?.subjectId);
  const { evaluation } = useGetEvaluation(recordId);

  const title = useMemo(() => {
    if (record == null) return getPageTitle("読み込み中");
    return getPageTitle(fmtRecordName(record));
  }, [record]);

  return (
    <WithRecordSelectableHeader>
      <Head>
        <title>{title}</title>
      </Head>
      {(record == null || subject == null || evaluation == null)
        ? <LoadingPane />
        : (
          <RecordDetail
            record={record}
            subject={subject}
            evaluation={evaluation}
          />
        )}
    </WithRecordSelectableHeader>
  );
};
