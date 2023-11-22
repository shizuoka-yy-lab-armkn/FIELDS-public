import * as schema from "@/gen/oapi/backend/v1/schema";
import { fmtDatetime } from "@/utils/datetime";

export const fmtRecordName = (record: schema.Record): string => {
  const d = new Date(record.startedAt);
  return `[${record.username}] 収録 ${record.seq} - ${fmtDatetime(d)}`;
};

export const frameIndexToTimestamp = (frameIndex: number, fps: number): string => {
  const secs = frameIndex / fps | 0;
  const m = secs / 60 | 0;
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const frameDiffToSecDuration = (frameBegin: number, frameEnd: number, fps: number): string => {
  const secs = (frameEnd - frameBegin) / fps;
  return secs.toFixed(1);
};
