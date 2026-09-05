"use server"

import { auth } from "@clerk/nextjs/server"
import { tasks } from "@trigger.dev/sdk"

// Type-only import: keeps the task code out of your app bundle.
import type { helloWorldTask } from "@/src/trigger/example"

export async function triggerHelloWorldAction(message: string) {
  const { orgId } = await auth()

  if (!orgId) {
    throw new Error("No active organization")
  }

  const handle = await tasks.trigger<typeof helloWorldTask>("hello-world", {
    message,
  })

  return { runId: handle.id }
}
