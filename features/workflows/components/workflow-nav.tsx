"use client"

import { useTransition } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Plus, Workflow as WorkflowIcon } from "lucide-react"

import type { Workflow } from "@/lib/db/schema"
import { generateSlug } from "@/features/workflows/lib/generate-slug"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"

interface WorkflowNavProps {
  workflows: Workflow[]
  createWorkflowAction: (name: string) => Promise<void>
}

export function WorkflowNav({
  workflows,
  createWorkflowAction,
}: WorkflowNavProps) {
  const { state } = useSidebar()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const isCollapsed = state === "collapsed"

  const handleCreateWorkflow = () => {
    startTransition(async () => {
      await createWorkflowAction(generateSlug())
    })
  }

  const workflowItems = workflows.map((workflow) => {
    const href = `/workflows/${workflow.id}`

    return (
      <SidebarMenuItem key={workflow.id}>
        <SidebarMenuButton asChild isActive={pathname === href}>
          <Link href={href}>
            <span>{workflow.name}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  })

  if (isCollapsed) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Popover>
                <PopoverTrigger asChild>
                  <SidebarMenuButton tooltip="Workflows">
                    <WorkflowIcon />
                    <span className="sr-only">Workflows</span>
                  </SidebarMenuButton>
                </PopoverTrigger>
                <PopoverContent side="right" align="start" className="p-1">
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={handleCreateWorkflow}
                        disabled={isPending}
                      >
                        <Plus />
                        <span>New workflow</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                  <SidebarSeparator className="mx-0 my-0" />
                  <SidebarMenu className="gap-y-1">{workflowItems}</SidebarMenu>
                </PopoverContent>
              </Popover>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workflows</SidebarGroupLabel>
      <SidebarGroupAction
        title="New workflow"
        onClick={handleCreateWorkflow}
        disabled={isPending}
      >
        <Plus />
        <span className="sr-only">New workflow</span>
      </SidebarGroupAction>
      <SidebarGroupContent>
        <SidebarMenu>{workflowItems}</SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
