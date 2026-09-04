"use client"

import * as React from "react"
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs"
import { Plus, Workflow } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

const workflows = [
  { id: "dominant-wasp", name: "dominant-wasp" },
  { id: "honest-reindeer", name: "honest-reindeer" },
  { id: "expected-llama", name: "expected-llama" },
  { id: "essential-ocelot", name: "essential-ocelot" },
  { id: "creepy-echidna", name: "creepy-echidna" },
  { id: "eastern-silkworm", name: "eastern-silkworm" },
  { id: "cultural-lion", name: "cultural-lion" },
  { id: "proud-weasel", name: "proud-weasel" },
  { id: "regional-bonobo", name: "regional-bonobo" },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [activeWorkflow, setActiveWorkflow] = React.useState(workflows[0].id)
  const { state, isMobile } = useSidebar()

  // The mobile sidebar renders full width inside a sheet, so it never collapses.
  const isCollapsed = state === "collapsed" && !isMobile

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader className="flex-row items-center justify-between gap-2 group-data-collapsible-icon:justify-center group-data-collapsible-icon:gap-0">
        <OrganizationSwitcher
          hidePersonal
          appearance={{
            elements: {
              rootBox: "min-w-0 group-data-[collapsible=icon]:!hidden",
              organizationSwitcherTrigger: "w-full justify-between",
            },
          }}
        />
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workflows</SidebarGroupLabel>
          <SidebarGroupAction title="New workflow">
            <Plus />
            <span className="sr-only">New workflow</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {workflows.map((workflow) => (
                <SidebarMenuItem key={workflow.id}>
                  <SidebarMenuButton
                    tooltip={workflow.name}
                    isActive={workflow.id === activeWorkflow}
                    onClick={() => setActiveWorkflow(workflow.id)}
                  >
                    {isCollapsed ? <Workflow /> : <span>{workflow.name}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="group-data-[collapsible=icon]:items-center">
        <UserButton
          appearance={{
            elements: {
              rootBox: "w-full",
              userButtonTrigger: "w-full justify-start group-data-[collapsible=icon]:justify-center",
              userButtonOuterIdentifier: "group-data-[collapsible=icon]:hidden",
            }
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
