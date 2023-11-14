import { http, HttpHandler } from "msw";
import { dummySubject } from "../data/subject";

export const mockSubjectsHandlers: HttpHandler[] = [
  http.get("/api/v1/subjects/s1", () => {
    return Response.json(dummySubject);
  }),
];
