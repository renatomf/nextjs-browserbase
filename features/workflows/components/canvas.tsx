"use client"

import { useCallback, useSyncExternalStore } from "react"
import type { CSSProperties } from "react"
import {
  addEdge,
  // Background,
  // BackgroundVariant,
  Controls,
  // MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  ConnectionLineType,
  type ColorMode,
  type Connection,
  type Edge,
  NodeTypes,
} from "@xyflow/react"
import { useTheme } from "next-themes"


import { StepNode } from "./step-node";
import type { StepNodeType } from "../nodes/node-registry"

import "@xyflow/react/dist/style.css";

const nodeTypes: NodeTypes = { step: StepNode }

const initialNodes: StepNodeType[] = [
  {
    id: "start",
    type: "step",
    position: { x: 0, y: 0 },
    data: { type: "start", kind: "trigger", title: "Start", values: {} },
  },
];

const initialEdges: Edge[] = [];

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
        nodeTypes={nodeTypes}
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
        {/* <MiniMap pannable zoomable /> */}
        <Controls />
      </ReactFlow>
    </div>
  )
}
