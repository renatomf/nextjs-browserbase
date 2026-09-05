"use client"

import { useRealtimeRun } from "@trigger.dev/react-hooks"

import type { helloWorldTask } from "@/src/trigger/example"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"

const FINISHED_STATUSES = [
  "COMPLETED",
  "CANCELED",
  "FAILED",
  "CRASHED",
  "INTERRUPTED",
  "SYSTEM_FAILURE",
  "EXPIRED",
  "TIMED_OUT",
]

function statusVariant(status: string) {
  if (status === "COMPLETED") return "default" as const
  if (status === "CANCELED" || status === "EXPIRED") return "outline" as const
  if (FINISHED_STATUSES.includes(status)) return "destructive" as const

  return "secondary" as const
}

interface WorkflowRunStatusProps {
  runId: string
  publicAccessToken: string
}

export function WorkflowRunStatus({
  runId,
  publicAccessToken,
}: WorkflowRunStatusProps) {
  const { run, error } = useRealtimeRun<typeof helloWorldTask>(runId, {
    accessToken: publicAccessToken,
    skipColumns: ["payload"],
  })

  if (error) {
    return (
      <p className="text-xs text-destructive">
        Lost connection to the run: {error.message}
      </p>
    )
  }

  if (!run) {
    return (
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Spinner className="size-3" />
        Connecting to run&hellip;
      </p>
    )
  }

  const isFinished = FINISHED_STATUSES.includes(run.status)
  const step = run.metadata?.status as string | undefined
  const progress = (run.metadata?.progress as number | undefined) ?? 0

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium">Latest run</span>
        <Badge variant={statusVariant(run.status)}>
          {!isFinished && <Spinner className="size-3" />}
          {run.status.toLowerCase().replace(/_/g, " ")}
        </Badge>
      </div>

      <Progress value={isFinished ? 100 : progress} />

      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
        {step && !isFinished && <span>{step}</span>}
        <span className="truncate font-mono" title={run.id}>
          {run.id}
        </span>
        {run.durationMs > 0 && (
          <span>{(run.durationMs / 1000).toFixed(1)}s</span>
        )}
      </div>

      {run.output && <p className="text-xs">{run.output.message}</p>}

      {run.error && (
        <p className="text-xs text-destructive">{run.error.message}</p>
      )}
    </div>
  )
}
