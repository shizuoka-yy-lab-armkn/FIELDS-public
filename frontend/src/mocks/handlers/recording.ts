import { FinishRecordingResp, RecordingAvailability, StartRecordingReq } from "@/gen/oapi/backend/v1/schema";
import { http, HttpHandler } from "msw";
import { dummyRecordInProgress } from "../data/record";

let currentRecoringInfo: { username: string; startAt: Date } | null = null;

export const mockRecordingHandlers: HttpHandler[] = [
  http.get("/api/v1/recording/availability", () => {
    if (currentRecoringInfo == null) {
      return Response.json(
        {
          type: "available",
        } satisfies RecordingAvailability,
      );
    }

    return Response.json(
      {
        type: "recording",
        username: currentRecoringInfo.username,
        startAt: currentRecoringInfo.startAt.toISOString(),
      } satisfies RecordingAvailability,
    );
  }),

  http.post("/api/v1/recording/start", async ({ request }) => {
    const req = await request.json() as StartRecordingReq;
    console.log("[mock] received req=", req);
    currentRecoringInfo = {
      username: req.username,
      startAt: new Date(),
    };
    return Response.json("");
  }),

  http.post("/api/v1/recording/finish", () => {
    currentRecoringInfo = null;
    return Response.json(
      {
        recordId: dummyRecordInProgress.recordId,
      } satisfies FinishRecordingResp,
    );
  }),
];
