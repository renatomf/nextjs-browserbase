"use client"

import { useCallback, useSyncExternalStore } from "react"
import type { CSSProperties } from "react"
import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  ConnectionLineType,
  type ColorMode,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react"
import { useTheme } from "next-themes"

import "@xyflow/react/dist/style.css"

const initialNodes: Node[] = [
  {
    id: "trigger",
    type: "input",
    position: { x: 0, y: 0 },
    data: { label: "Trigger" },
  },
  {
    id: "browse",
    position: { x: 0, y: 120 },
    data: { label: "Browse page" },
  },
  {
    id: "extract",
    position: { x: 0, y: 240 },
    data: { label: "Extract data" },
  },
  {
    id: "done",
    type: "output",
    position: { x: 0, y: 360 },
    data: { label: "Done" },
  },
]

const emptySubscribe = () => () => {}

/**
 * False during server render and hydration, true afterwards. React uses the
 * server snapshot for both passes, so gating on this keeps the two renders
 * identical.
 */
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )
}

const initialEdges: Edge[] = [
  { id: "trigger-browse", source: "trigger", target: "browse" },
  { id: "browse-extract", source: "browse", target: "extract" },
  { id: "extract-done", source: "extract", target: "done" },
]

export function Canvas() {
  const mounted = useMounted()
  const { resolvedTheme } = useTheme()
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((currentEdges) => addEdge(connection, currentEdges)),
    [setEdges],
  )

  // React Flow resolves "system" with matchMedia during render, which differs
  // between server and client. Pin to light until mounted so both agree.
  const colorMode: ColorMode =
    mounted && resolvedTheme === "dark" ? "dark" : "light"

  return (
    <div className="size-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        colorMode={colorMode}
        fitView
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{ stroke: "var(--border)", strokeWidth: 2 }}
        defaultEdgeOptions={{ 
          type: "smoothstep",
          style: { stroke: "var(--border)", strokeWidth: 2 }
        }}
        style={
          {
            "--xy-background-color": "var(--background)",
            "--xy-edge-stroke-width": 2,
            "--xy-connectionline-stroke-width": 2,
          } as CSSProperties
        }
        maxZoom={1}
      >
        {/* <Background variant={BackgroundVariant.Dots} gap={16} size={1} /> */}
        <MiniMap pannable zoomable />
        <Controls />
      </ReactFlow>
    </div>
  )
}
