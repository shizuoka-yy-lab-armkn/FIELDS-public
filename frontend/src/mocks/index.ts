import { env } from "@/config/env.mjs";

async function initMocks() {
  if (typeof window === "undefined") {
    // If you wanna use server side mock, refer to:
    // https://github.com/vercel/next.js/tree/f7baa56792cf8566954f762b961260a00c476994/examples/with-msw
  } else {
    const { worker } = await import("./browser");
    worker.start({
      onUnhandledRequest: (req, print) => {
        if (!req.url.toString().startsWith(env.NEXT_PUBLIC_BACKEND_BASE_URL)) {
          return;
        }
        if (!req.url.startsWith("/api/")) {
          return;
        }
        print.warning();
      },
    });
  }
}

initMocks();

export {};
