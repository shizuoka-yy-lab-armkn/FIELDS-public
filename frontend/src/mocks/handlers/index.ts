import { HttpHandler } from "msw";
import { mockRecordingHandlers } from "./recording";
import { mockRecordsHandlers } from "./records";
import { mockSubjectsHandlers } from "./subject";
import { mockUsersHandlers } from "./users";

export const mockHandlers: readonly HttpHandler[] = [
  ...mockRecordsHandlers,
  ...mockRecordingHandlers,
  ...mockSubjectsHandlers,
  ...mockUsersHandlers,
] as const;
