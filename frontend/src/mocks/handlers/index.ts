import { HttpHandler } from "msw";
import { mockExemplarVideoHandlers } from "./exemplarVideo";
import { mockRecordingHandlers } from "./recording";
import { mockRecordsHandlers } from "./records";
import { mockSubjectsHandlers } from "./subject";
import { mockUsersHandlers } from "./users";

export const mockHandlers: readonly HttpHandler[] = [
  ...mockExemplarVideoHandlers,
  ...mockRecordingHandlers,
  ...mockRecordsHandlers,
  ...mockSubjectsHandlers,
  ...mockUsersHandlers,
] as const;
