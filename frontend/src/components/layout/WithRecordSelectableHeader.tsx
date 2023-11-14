import { useGetRecordList } from "@/gen/oapi/backend/v1/client/records/records";
import { useRouterRecordId } from "@/hooks/records";
import { ReactNode } from "react";
import { WithHeader } from "./WithHeader";

type WithRecordSelectableHeaderProps = {
  children: ReactNode;
};

export const WithRecordSelectableHeader = ({ children }: WithRecordSelectableHeaderProps) => {
  const { data: records } = useGetRecordList({
    query: { staleTime: 1000 * 60 },
  });

  const currentRecordId = useRouterRecordId();

  return (
    <WithHeader headerProps={{ records, currentRecordId }}>
      {children}
    </WithHeader>
  );
};
