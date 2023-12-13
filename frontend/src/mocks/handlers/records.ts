import { RecordEvaluation } from "@/gen/oapi/backend/v1/schema";
import { http, HttpHandler } from "msw";
import { dummyRecordEvaluation, dummyRecordInProgress, dummyRecords } from "../data/record";

let evaluationProgress = 0;
let evaluationProgressLoopId: number | undefined = undefined;

export const mockRecordsHandlers: HttpHandler[] = [
  http.get("/api/v1/records", () => {
    return Response.json(dummyRecords);
  }),

  http.get("/api/v1/records/:recordId", ({ params }) => {
    const { recordId } = params;
    const r = dummyRecords.find((r) => r.recordId === recordId);
    return Response.json(r ?? "", { status: r == null ? 404 : 200 });
  }),

  http.get("/api/v1/records/:recordId/evaluation", ({ params }) => {
    const { recordId } = params;
    const r = dummyRecords.find((r) => r.recordId === recordId);

    if (r == null) {
      return Response.json("", { status: 404 });
    }

    if (r.recordId !== dummyRecordInProgress.recordId) {
      return Response.json(dummyRecordEvaluation);
    }

    if (evaluationProgress <= 0) {
      evaluationProgress = 0;

      evaluationProgressLoopId = window.setInterval(() => {
        evaluationProgress += 7 + Math.random() * 5;
        if (evaluationProgress >= 99) {
          evaluationProgress = 100;
          clearInterval(evaluationProgressLoopId);
        }
      }, 1500);
    }

    const p = evaluationProgress;
    if (p >= 100) {
      setTimeout(() => {
        evaluationProgress = 0;
      }, 3000);
    }

    return Response.json(
      {
        jobProgressPercentage: p,
        segs: [],
      } satisfies RecordEvaluation,
    );
  }),
];
