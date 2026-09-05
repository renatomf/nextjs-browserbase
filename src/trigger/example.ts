import { logger, metadata, task, wait } from "@trigger.dev/sdk"

export type HelloWorldPayload = {
  message?: string
}

export const helloWorldTask = task({
  id: "hello-world",
  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async (payload: HelloWorldPayload, { ctx }) => {
    logger.log("Hello, world!", { payload, ctx })

    metadata.set("status", "Starting up").set("progress", 10)

    await wait.for({ seconds: 2 })

    metadata.set("status", "Running steps").set("progress", 55)

    await wait.for({ seconds: 3 })

    metadata.set("status", "Wrapping up").set("progress", 100)

    return {
      message: payload.message ?? "Task finished successfully!",
    }
  },
})
