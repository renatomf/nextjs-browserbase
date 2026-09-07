import toposort from "toposort"
import { logger, task } from "@trigger.dev/sdk"
import {
  browserbase,
  Stagehand,
  type StagehandBrowser,
} from "@browserbasehq/stagehand"
import { nodeExecutors } from "@/features/workflows/nodes/node-executors"
import { interpolate } from "@/features/workflows/lib/interpolate"
import { getWorkflow } from "@/features/workflows/data"

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

    for (const id of order) {
      const node = byId.get(id)!
      logger.log(`Running step: ${node.data.title}`)
      //TODO: report each node's progress so the UI can watch the run live.
      const executor = nodeExecutors[node.data.type]
      if (!executor) continue

      const values = Object.fromEntries(
        Object.entries(node.data.values).map(([key, value]) => [
          key,
          interpolate(value, outputs),
        ])
      )

      outputs[id] = await executor({ values, getStagehand })
    }

    await stagehand?.close()

    return { steps: order.length }
  },
})
