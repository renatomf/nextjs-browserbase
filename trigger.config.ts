import { defineConfig } from "@trigger.dev/sdk"

export default defineConfig({
  project: "proj_vibhoylenbwxjwtffamq",
  runtime: "node-24",
  logLevel: "log",
  // The max compute seconds a task is allowed to run. If the task run exceeds this duration, it will be stopped.
  // You can override this on an individual task.
  // See https://trigger.dev/docs/runs/max-duration
  maxDuration: 3600,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ["features"],
  build: {
    // Stagehand ships a Chrome extension zip that it uploads to Browserbase on
    // session start, and it finds that zip by walking up from its own file. Once
    // bundled, that walk lands inside .trigger/ instead of node_modules and the
    // read fails, surfacing as "Failed to upload the Stagehand extension". Keeping
    // the package external leaves it in node_modules with its assets intact.
    external: ["@browserbasehq/stagehand"],
  },
})
