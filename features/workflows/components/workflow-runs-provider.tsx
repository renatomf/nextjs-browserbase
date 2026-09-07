"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"
import { useRealtimeRunsWithTag } from "@trigger.dev/react-hooks"

import type {
  RunStep,
  runWorkflowTask,
} from "@/features/workflows/tasks/run-workflow"

type WorkflowRuns = ReturnType<
  typeof useRealtimeRunsWithTag<typeof runWorkflowTask>
>

type WorkflowRunsValue = Pick<WorkflowRuns, "runs" | "error">

// One subscription for the whole canvas. Every component that wants run state
// reads it from here instead of opening a socket of its own.
const WorkflowRunsContext = createContext<WorkflowRunsValue | null>(null)

interface WorkflowRunsProviderProps {
  workflowId: string
  // A Trigger.dev public access token scoped to read this workflow's tag, minted
  // on the server: auth.createPublicToken({ scopes: { read: { tags: [...] } } }).
  publicAccessToken: string
  children: ReactNode
}

export function WorkflowRunsProvider({
  workflowId,
  publicAccessToken,
  children,
}: WorkflowRunsProviderProps) {
  // Runs are tagged workflow:<id> when the Run button triggers them, so the tag
  // is the handle on "every run of this workflow" without tracking run ids.
  const { runs, error } = useRealtimeRunsWithTag<typeof runWorkflowTask>(
    `workflow:${workflowId}`,
    {
      accessToken: publicAccessToken,
      // The payload is just the ids we already have on the client — no reason to
      // pull it over the wire on every update. output and metadata are the point.
      skipColumns: ["payload"],
    }
  )

  const value = useMemo(() => ({ runs, error }), [runs, error])

  return (
    <WorkflowRunsContext.Provider value={value}>
      {children}
    </WorkflowRunsContext.Provider>
  )
}

function useWorkflowRuns() {
  const value = useContext(WorkflowRunsContext)

  if (!value) {
    throw new Error("useWorkflowRuns must be used inside a WorkflowRunsProvider")
  }

  return value
}

// The steps of the workflow's most recent run, and whether that run is still
// going — what the canvas needs to paint per-node progress.
export function useLatestRunSteps(): { steps: RunStep[]; isLive: boolean } {
  const { runs } = useWorkflowRuns()

  return useMemo(() => {
    const latest = runs.reduce<(typeof runs)[number] | undefined>(
      (newest, run) =>
        !newest || run.createdAt > newest.createdAt ? run : newest,
      undefined
    )

    if (!latest) return { steps: [], isLive: false }

    // The run carries its own booleans, derived from the same status mapping the
    // SDK uses, so the canvas never has to keep its own list of status strings in
    // sync with the ones Trigger.dev happens to send.
    const isLive =
      latest.isQueued || latest.isExecuting || latest.isWaiting

    // The task returns its final steps on success, which is the authoritative
    // finished state; metadata is the live view while the run is still going (and
    // the only place a failed run's steps ever land, since it returns no output).
    const steps =
      latest.output?.steps ??
      (latest.metadata?.steps as RunStep[] | undefined) ??
      []

    // A failed run's own "failed" step write is the last thing it does before
    // throwing, and it can be lost — a dropped flush, a killed worker, a timeout.
    // The run status is what always arrives, and steps run strictly in order, so
    // the first step that never reached "done" is where the run stopped. Marking
    // it is what puts the red border on the node that actually broke.
    if (latest.isFailed) {
      const stopped = steps.findIndex((step) => step.status !== "done")

      if (stopped !== -1 && steps[stopped].status !== "failed") {
        const repaired = [...steps]
        repaired[stopped] = { ...steps[stopped], status: "failed" }
        return { steps: repaired, isLive }
      }
    }

    return { steps, isLive }
  }, [runs])
}
