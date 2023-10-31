import { defineConfig } from "orval";

export default defineConfig({
  backendV1: {
    input: "../docs/backend.v1.openapi.json",
    output: {
      target: "./src/gen/oapi/backend/v1/client",
      schemas: "./src/gen/oapi/backend/v1/schema",
      mode: "tags-split",
      client: "react-query",
      mock: false,
      clean: true,
      override: {
        useTypeOverInterfaces: true,
      }
    },
    hooks: {
      afterAllFilesWrite: "dprint fmt",
    },
  },
});
