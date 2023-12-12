import { http, HttpHandler } from "msw";
import { dummyUsers } from "../data/users";

export const mockUsersHandlers: HttpHandler[] = [
  http.get("/api/v1/users", () => {
    return Response.json(dummyUsers);
  }),
];
