import toposort from "toposort"
import { logger, metadata, task } from "@trigger.dev/sdk"
import {
  browserbase,
  Stagehand,
  type StagehandBrowser,
} from "@browserbasehq/stagehand"
import { nodeExecutors } from "@/features/workflows/nodes/node-executors"
import { interpolate } from "@/features/workflows/lib/interpolate"
import { getWorkflow } from "@/features/workflows/data"

// One node's live progress, published under the run's "steps" metadata so the
// canvas can follow along while the run is still going.
export type RunStep = {
  nodeId: string
  status: "pending" | "running" | "done" | "failed"
}

// The Trigger.dev task the Run button fires. It loads the saved graph, works out
// what order the nodes should run in, and walks them, handing each node an
// executor from the registry.
export const runWorkflowTask = task({
  id: "run-workflow",
  run: async ({ workflowId, orgId }: { workflowId: string; orgId: string }) => {
    const workflow = await getWorkflow(orgId, workflowId)
    if (!workflow?.graph) throw new Error(`Workflow ${workflowId} has no graph`)

    const { nodes, edges } = workflow.graph
    const byId = new Map(nodes.map((n) => [n.id, n]))

    // Run only connected nodes — anything touching an edge. Orphans dropped on
    // the canvas are skipped. toposort orders them and throws on a cycle.
    const connected = new Set(edges.flatMap((e) => [e.source, e.target]))
    const order = toposort
      .array(
        nodes.map((n) => n.id),
        edges.map((e) => [e.source, e.target])
      )
      .filter((id) => connected.has(id))

    logger.log(`Running workflow ${workflow.name}`, { steps: order.length })

    // Publish the whole plan up front so the canvas has every step from the
    // first frame. Only nodes with an executor are listed — the rest never run,
    // so a step for one would sit at "pending" forever.
    let steps: RunStep[] = order
      .filter((id) => nodeExecutors[byId.get(id)!.data.type])
      .map((nodeId) => ({ nodeId, status: "pending" }))

    metadata.set("steps", steps)

    // Rebuilt rather than mutated, and that is load-bearing: metadata.set keeps
    // the array it is handed, then drops the next set as a no-op if the new value
    // deep-equals what it is holding. Editing a step in place edits the copy the
    // store holds too, so both sides always match and every update after the
    // first is silently discarded. A fresh array each time is what makes the
    // change visible to the diff, and so to the canvas.
    const setStatus = (nodeId: string, status: RunStep["status"]) => {
      steps = steps.map((step) =>
        step.nodeId === nodeId ? { ...step, status } : step
      )
      metadata.set("steps", steps)
    }

    // metadata.flush() returns without doing anything if a flush is already in
    // flight, and one runs on a background timer roughly every second. On the
    // failure path that silence is fatal: the run throws immediately after, so a
    // skipped flush means the "failed" step never leaves the worker. Retrying
    // past the in-flight window is what actually gets it to the canvas.
    const flushSteps = async () => {
      for (let attempt = 0; attempt < 3; attempt++) {
        await metadata.flush()
        await new Promise((resolve) => setTimeout(resolve, 200))
      }
    }

    // The run owns one Browserbase session, opened lazily on the first browser
    // step and reused by every later one, so the recording spans the whole flow.
    let browser: StagehandBrowser | undefined
    let stagehand: Stagehand | undefined
    // The Browserbase session id, captured the moment the session opens so it can
    // be returned in the run's output — a panel reads it there to fetch the replay
    // once the run finishes and the recording is available.
    let browserbaseSessionId: string | undefined

    const getStagehand = async () => {
      if (stagehand) return stagehand

      const apiKey = process.env.BROWSERBASE_API_KEY
      if (!apiKey) throw new Error("BROWSERBASE_API_KEY is not set")

      // v4 splits what v3's constructor did: a factory opens the session, then
      // Stagehand.create() attaches to it (the constructor itself is private).
      browser = await browserbase.launch({ apiKey })
      browserbaseSessionId = browser.sessionId
      logger.log("Started Browserbase session", { browserbaseSessionId })

      // The same Browserbase key again, this time as the Stagehand API key — it's
      // what unlocks the managed services, so the LLM routes through Browserbase's
      // Model Gateway and no separate provider key is needed.
      stagehand = await Stagehand.create({
        browser,
        apiKey,
        model: { modelName: "google/gemini-2.5-flash" },
      })
      return stagehand
    }

    // What each node returned, keyed by node id, so later nodes can reference it
    // through {{ nodeId.path }} placeholders in their own fields. Nodes run in
    // dependency order, so anything a node points at is already in here.
    const outputs: Record<string, unknown> = {}

    try {
      for (const id of order) {
        const node = byId.get(id)!
        logger.log(`Running step: ${node.data.title}`)
        const executor = nodeExecutors[node.data.type]
        if (!executor) continue

        setStatus(id, "running")
        // Metadata is flushed on a background timer, so without forcing it here
        // "running" would be overwritten by "done" in memory before it was ever
        // pushed and the canvas would never show the step in flight.
        await metadata.flush()

        const values = Object.fromEntries(
          Object.entries(node.data.values).map(([key, value]) => [
            key,
            interpolate(value, outputs),
          ])
        )

        try {
          outputs[id] = await executor({ values, getStagehand })
        } catch (error) {
          setStatus(id, "failed")
          // A thrown run returns no output, so this flush is the only way the
          // failed state ever reaches the canvas.
          await flushSteps()
          throw error
        }

        setStatus(id, "done")
      }
    } finally {
      await stagehand?.close()
    }

    // Returned as well as published: a completed run's output is guaranteed to
    // carry the finished state even if the last metadata flush is missed.
    return { steps }
  },
})
