// NOTE: next.config.mjs で import できるように .mjs にしている
// (2023-10-31 現在、next.config は TypeScript での記述に対応していない)

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {},
  client: {
    /** バックエンドAPIのベースURL */
    NEXT_PUBLIC_BACKEND_BASE_URL: z.string().url().regex(/^https?:.*[a-zA-Z0-9]$/),
  },
  runtimeEnv: {
    // ここで実際の環境変数とマッピングを行う
    NEXT_PUBLIC_BACKEND_BASE_URL: process.env.NEXT_PUBLIC_BACKEND_BASE_URL,
  },
});
