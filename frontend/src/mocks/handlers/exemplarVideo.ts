import { ExemplarVideo } from "@/gen/oapi/backend/v1/schema";
import { http, HttpHandler } from "msw";
import { dummyExemplarVideo } from "../data/exemplarVideo";

export const mockExemplarVideoHandlers: HttpHandler[] = [
  http.get("/api/v1/exemplar-videos", () => {
    return Response.json([dummyExemplarVideo] satisfies ExemplarVideo[]);
  }),

  http.get("/api/v1/exemplar-videos/:id", ({ params }) => {
    const { id } = params;
    if (id === dummyExemplarVideo.id) {
      return Response.json(dummyExemplarVideo satisfies ExemplarVideo);
    }
    return Response.json("", { status: 404 });
  }),
];
