import { Plus, Workflow } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function Page() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Workflow />
        </EmptyMedia>
        <EmptyTitle>No workflow selected</EmptyTitle>
        <EmptyDescription>
          Select a workflow from the sidebar or create a new one to get started.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>
          <Plus />
          New workflow
        </Button>
      </EmptyContent>
    </Empty>
  )
}
