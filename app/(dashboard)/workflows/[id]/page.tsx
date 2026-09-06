import { notFound } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { ReactFlowProvider } from "@xyflow/react"

import { getLiveblocks } from "@/lib/liveblocks"
import { getWorkflow } from "@/features/workflows/data"
import { Room } from "@/features/workflows/components/room"
import { WorkflowShell } from "@/features/workflows/components/workflow-shell"

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { orgId } = await auth()
  if (!orgId) notFound()

  const workflow = await getWorkflow(orgId, id)
  if (!workflow) notFound()

  // Rooms are private by default under ID-token auth. Grant write access to tht owning org, matching the `groupIds: [orgId]` issued by the auth endpoint.
  await getLiveblocks().getOrCreateRoom(id, {
    organizationId: orgId,
    defaultAccesses: [],
    groupsAccesses: {
      [orgId]: ["room:write"],
    },
    metadata: {
      title: workflow.name,
    },
  })

  // The palette lives in the sidebar, outside <ReactFlow>, so the provider has
  // to sit above both of them for the two to share a single React Flow store.
  return (
    <Room roomId={id}>
      <ReactFlowProvider>
        <WorkflowShell workflowId={id} />
      </ReactFlowProvider>
    </Room>
  )
}
