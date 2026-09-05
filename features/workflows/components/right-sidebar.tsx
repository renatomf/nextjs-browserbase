"use client"

import { useState, useTransition } from "react"
import { PlayIcon } from "lucide-react"
import { toast } from "sonner"

import { WorkflowRunStatus } from "@/features/workflows/components/workflow-run-status"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

interface RunHandle {
  runId: string
  publicAccessToken: string
}

interface RightSidebarProps {
  workflowId: string
  runWorkflowAction: (workflowId: string) => Promise<RunHandle>
}

export function RightSidebar({
  workflowId,
  runWorkflowAction,
}: RightSidebarProps) {
  const [handle, setHandle] = useState<RunHandle | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleRunWorkflow = () => {
    startTransition(async () => {
      try {
        setHandle(await runWorkflowAction(workflowId))
      } catch {
        setHandle(null)
        toast.error("Failed to start workflow run")
      }
    })
  }

  return (
    <div className="flex size-full flex-col gap-4 p-4">
      <Button onClick={handleRunWorkflow} disabled={isPending}>
        {isPending ? <Spinner /> : <PlayIcon />}
        Run
      </Button>

      {handle && (
        <WorkflowRunStatus
          key={handle.runId}
          runId={handle.runId}
          publicAccessToken={handle.publicAccessToken}
        />
      )}
    </div>
  )
}
