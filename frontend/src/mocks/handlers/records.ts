import { http, HttpHandler } from "msw";
import { dummyRecord, dummyRecordEvaluation } from "../data/record";

export const mockRecordsHandlers: HttpHandler[] = [
  http.get("/api/v1/records", () => {
    return Response.json([dummyRecord]);
  }),

  http.get("/api/v1/records/r1", () => {
    return Response.json(dummyRecord);
  }),

  http.get("/api/v1/records/r1/evaluation", () => {
    return Response.json(dummyRecordEvaluation);
  }),
];
