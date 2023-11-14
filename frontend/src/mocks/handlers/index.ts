import { HttpHandler } from "msw";
import { mockRecordsHandlers } from "./records";
import { mockSubjectsHandlers } from "./subject";

export const mockHandlers: readonly HttpHandler[] = [
  ...mockSubjectsHandlers,
  ...mockRecordsHandlers,
] as const;
