import * as schema from "@/gen/oapi/backend/v1/schema";
import { dummySubject } from "./subject";

const dummyRecord: schema.Record = {
  recordId: "r1",
  subjectId: dummySubject.id,
  username: "test1",
  foreheadVideoUrl: "/_static/dummy.mp4",
  foreheadVideoFps: 29.97,
  startedAt: "2023-11-14T01:52:31.174Z",
  finishedAt: "2023-11-14T01:55:47.0Z",
  seq: 1,
};

export const dummyRecords: readonly schema.Record[] = new Array(20).fill(dummyRecord).map((r, i) => ({
  ...r,
  recordId: `r${i + 1}`,
  seq: i + 1,
}));

export const dummyRecordInProgress = dummyRecords.at(-1)!;

export const dummyRecordEvaluation: schema.RecordEvaluation = {
  jobProgressPercentage: 100,
  segs: [
    {
      type: "valid",
      actionSeq: 5,
      begin: 348,
      end: 404,
    },
    {
      type: "valid",
      actionSeq: 6,
      begin: 404,
      end: 766,
    },
    {
      type: "valid",
      actionSeq: 7,
      begin: 766,
      end: 922,
    },
    {
      type: "valid",
      actionSeq: 8,
      begin: 922,
      end: 2141,
    },
    {
      type: "valid",
      actionSeq: 9,
      begin: 2141,
      end: 2403,
    },
    {
      type: "missing",
      actionSeq: 10,
    },
    {
      type: "valid",
      actionSeq: 11,
      begin: 2403,
      end: 2611,
    },
    {
      type: "valid",
      actionSeq: 12,
      begin: 2611,
      end: 3255,
    },
    {
      type: "valid",
      actionSeq: 13,
      begin: 3255,
      end: 3519,
    },
    {
      type: "valid",
      actionSeq: 14,
      begin: 3519,
      end: 4131,
    },
    {
      type: "valid",
      actionSeq: 15,
      begin: 4131,
      end: 4318,
    },
    {
      type: "valid",
      actionSeq: 16,
      begin: 4318,
      end: 4559,
    },
    {
      type: "valid",
      actionSeq: 17,
      begin: 4559,
      end: 5081,
    },
    {
      type: "wrong",
      actionSeq: 19,
      begin: 5081,
      end: 5649,
    },
    {
      type: "wrong",
      actionSeq: 18,
      begin: 5649,
      end: 5787,
    },
    {
      type: "valid",
      actionSeq: 20,
      begin: 5787,
      end: 6008,
    },
    {
      type: "valid",
      actionSeq: 21,
      begin: 6008,
      end: 6775,
    },
    {
      type: "valid",
      actionSeq: 22,
      begin: 6775,
      end: 7017,
    },
    {
      type: "valid",
      actionSeq: 23,
      begin: 7017,
      end: 7461,
    },
    {
      type: "valid",
      actionSeq: 24,
      begin: 7461,
      end: 7728,
    },
    {
      type: "valid",
      actionSeq: 25,
      begin: 7728,
      end: 8274,
    },
    {
      type: "wrong",
      actionSeq: 33,
      begin: 8274,
      end: 8429,
    },
    {
      type: "valid",
      actionSeq: 26,
      begin: 8429,
      end: 8774,
    },
    {
      type: "valid",
      actionSeq: 27,
      begin: 8774,
      end: 9305,
    },
    {
      type: "valid",
      actionSeq: 28,
      begin: 9305,
      end: 9513,
    },
    {
      type: "valid",
      actionSeq: 29,
      begin: 9513,
      end: 10043,
    },
    {
      type: "valid",
      actionSeq: 30,
      begin: 10043,
      end: 10532,
    },
    {
      type: "valid",
      actionSeq: 31,
      begin: 10532,
      end: 11006,
    },
    {
      type: "valid",
      actionSeq: 32,
      begin: 11006,
      end: 11528,
    },
    {
      type: "wrong",
      actionSeq: 35,
      begin: 11528,
      end: 11695,
    },
    {
      type: "wrong",
      actionSeq: 36,
      begin: 11695,
      end: 11846,
    },
    {
      type: "wrong",
      actionSeq: 33,
      begin: 11846,
      end: 11962,
    },
    {
      type: "wrong",
      actionSeq: 34,
      begin: 11962,
      end: 12080,
    },
    {
      type: "missing",
      actionSeq: 37,
    },
    {
      type: "valid",
      actionSeq: 38,
      begin: 12080,
      end: 12423,
    },
    {
      type: "valid",
      actionSeq: 39,
      begin: 12423,
      end: 12456,
    },
  ],
};
