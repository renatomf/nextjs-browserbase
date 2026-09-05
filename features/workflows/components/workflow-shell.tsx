import { runWorkflowAction } from "@/features/workflows/actions"
import { RightSidebar } from "@/features/workflows/components/right-sidebar"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

interface WorkflowShellProps {
  workflowId: string
}

export function WorkflowShell({ workflowId }: WorkflowShellProps) {
  return (
    <ResizablePanelGroup
      id={`workflow-${workflowId}`}
      orientation="horizontal"
      className="size-full"
    >
      <ResizablePanel minSize="30rem">
        <ResizablePanelGroup
          id={`workflow-${workflowId}-primary`}
          orientation="vertical"
          className="size-full"
        >
          <ResizablePanel minSize="18rem">
            <div className="flex size-full items-center justify-center">
              <p className="text-sm text-muted-foreground">Canvas</p>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="8rem" minSize="6rem">
            <div className="flex size-full items-center justify-center">
              <p className="text-sm text-muted-foreground">Logs</p>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="16rem" minSize="14rem" maxSize="36rem">
        <RightSidebar
          workflowId={workflowId}
          runWorkflowAction={runWorkflowAction}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
