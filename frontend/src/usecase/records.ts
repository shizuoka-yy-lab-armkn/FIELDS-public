import * as schema from "@/gen/oapi/backend/v1/schema";
import { fmtDatetime } from "@/utils/datetime";

export const fmtRecordName = (record: schema.Record): string => {
  const d = new Date(record.startedAt);
  return `収録 ${record.seq} - ${fmtDatetime(d)}`;
};
