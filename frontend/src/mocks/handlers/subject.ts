import { SubjectBrief } from "@/gen/oapi/backend/v1/schema";
import { http, HttpHandler } from "msw";
import { dummySubject } from "../data/subject";

export const mockSubjectsHandlers: HttpHandler[] = [
  http.get("/api/v1/subjects/s1", () => {
    return Response.json(dummySubject);
  }),

  http.get("/api/v1/subjects", () => {
    const subjects: SubjectBrief[] = [dummySubject];
    return Response.json(subjects);
  }),
];
