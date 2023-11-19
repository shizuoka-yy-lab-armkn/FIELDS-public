import * as schema from "@/gen/oapi/backend/v1/schema";
import { dummySubject } from "./subject";

export const dummyRecord: schema.Record = {
  recordId: "r1",
  subjectId: dummySubject.id,
  fps: 29.97,
  headCameraVideoUrl: "/_static/dummy.mp4",
  recordAt: "2023-11-14T01:52:31.174Z",
  seq: 1,
};

export const dummyRecordEvaluation: schema.RecordEvaluation = {
  segs: [
    {
      type: "valid",
      actionId: 5,
      begin: 348,
      end: 404,
    },
    {
      type: "valid",
      actionId: 6,
      begin: 404,
      end: 766,
    },
    {
      type: "valid",
      actionId: 7,
      begin: 766,
      end: 922,
    },
    {
      type: "valid",
      actionId: 8,
      begin: 922,
      end: 2141,
    },
    {
      type: "valid",
      actionId: 9,
      begin: 2141,
      end: 2403,
    },
    {
      type: "missing",
      actionId: 10,
    },
    {
      type: "valid",
      actionId: 11,
      begin: 2403,
      end: 2611,
    },
    {
      type: "valid",
      actionId: 12,
      begin: 2611,
      end: 3255,
    },
    {
      type: "valid",
      actionId: 13,
      begin: 3255,
      end: 3519,
    },
    {
      type: "valid",
      actionId: 14,
      begin: 3519,
      end: 4131,
    },
    {
      type: "valid",
      actionId: 15,
      begin: 4131,
      end: 4318,
    },
    {
      type: "valid",
      actionId: 16,
      begin: 4318,
      end: 4559,
    },
    {
      type: "valid",
      actionId: 17,
      begin: 4559,
      end: 5081,
    },
    {
      type: "wrong",
      actionId: 19,
      expectedActionId: 18,
      begin: 5081,
      end: 5649,
    },
    {
      type: "wrong",
      actionId: 18,
      expectedActionId: 19,
      begin: 5649,
      end: 5787,
    },
    {
      type: "valid",
      actionId: 20,
      begin: 5787,
      end: 6008,
    },
    {
      type: "valid",
      actionId: 21,
      begin: 6008,
      end: 6775,
    },
    {
      type: "valid",
      actionId: 22,
      begin: 6775,
      end: 7017,
    },
    {
      type: "valid",
      actionId: 23,
      begin: 7017,
      end: 7461,
    },
    {
      type: "valid",
      actionId: 24,
      begin: 7461,
      end: 7728,
    },
    {
      type: "valid",
      actionId: 25,
      begin: 7728,
      end: 8274,
    },
    {
      type: "extra",
      actionId: 33,
      begin: 8274,
      end: 8429,
    },
    {
      type: "valid",
      actionId: 26,
      begin: 8429,
      end: 8774,
    },
    {
      type: "valid",
      actionId: 27,
      begin: 8774,
      end: 9305,
    },
    {
      type: "valid",
      actionId: 28,
      begin: 9305,
      end: 9513,
    },
    {
      type: "valid",
      actionId: 29,
      begin: 9513,
      end: 10043,
    },
    {
      type: "valid",
      actionId: 30,
      begin: 10043,
      end: 10532,
    },
    {
      type: "valid",
      actionId: 31,
      begin: 10532,
      end: 11006,
    },
    {
      type: "valid",
      actionId: 32,
      begin: 11006,
      end: 11528,
    },
    {
      type: "missing",
      actionId: 33,
    },
    {
      type: "missing",
      actionId: 34,
    },
    {
      type: "valid",
      actionId: 35,
      begin: 11528,
      end: 11695,
    },
    {
      type: "valid",
      actionId: 36,
      begin: 11695,
      end: 11846,
    },
    {
      type: "extra",
      actionId: 33,
      begin: 11846,
      end: 11962,
    },
    {
      type: "extra",
      actionId: 34,
      begin: 11962,
      end: 12080,
    },
    {
      type: "missing",
      actionId: 37,
    },
    {
      type: "valid",
      actionId: 38,
      begin: 12080,
      end: 12423,
    },
    {
      type: "valid",
      actionId: 39,
      begin: 12423,
      end: 12456,
    },
  ],
};
