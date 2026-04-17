import { useCallback, useEffect, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  useEdgesState,
  useNodesState,
  type Edge,
  type ReactFlowInstance,
} from '@xyflow/react'
import { Graph, layout } from '@dagrejs/dagre'

import { ServiceNode, type ServiceNodeType } from './service-node'
import { architectures } from '#/data/architectures'
import { services as allServices } from '#/data/services'
import { useExplorerStore } from '#/stores/explorer-store'

import '@xyflow/react/dist/style.css'

// ─── Constants ────────────────────────────────────────────────
const NODE_WIDTH = 160
const NODE_HEIGHT = 80

const nodeTypes = { service: ServiceNode }

// ─── Dagre layout helper ──────────────────────────────────────
function getLayoutedElements(
  nodes: ServiceNodeType[],
  edges: Edge[],
): { nodes: ServiceNodeType[]; edges: Edge[] } {
  const g = new Graph()
  g.setGraph({ rankdir: 'LR', nodesep: 50, ranksep: 100, marginx: 40, marginy: 40 })
  g.setDefaultEdgeLabel(() => ({}))

  for (const node of nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target)
  }

  layout(g)

  const layoutedNodes: ServiceNodeType[] = nodes.map((node) => {
    const pos = g.node(node.id)
    return {
      ...node,
      position: {
        x: (pos.x ?? 0) - NODE_WIDTH / 2,
        y: (pos.y ?? 0) - NODE_HEIGHT / 2,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}

// ─── Derive role for a service in an architecture ─────────────
function getServiceRole(archId: string, serviceId: string): string {
  const arch = architectures.find((a) => a.id === archId)
  if (!arch) return ''
  const edge = arch.edges.find(
    (e) => e.source === serviceId || e.target === serviceId,
  )
  return edge?.label ?? ''
}

// ─── Component ────────────────────────────────────────────────
interface FlowCanvasProps {
  architectureId: string
}

export function FlowCanvas({ architectureId }: FlowCanvasProps) {
  const selectedServiceId = useExplorerStore((s) => s.selectedServiceId)

  const arch = useMemo(
    () => architectures.find((a) => a.id === architectureId),
    [architectureId],
  )

  // Build nodes from architecture services
  const initialData = useMemo(() => {
    if (!arch) return { nodes: [] as ServiceNodeType[], edges: [] as Edge[] }

    const svcMap = new Map(allServices.map((s) => [s.id, s]))

    const rawNodes: ServiceNodeType[] = []
    for (const svcId of arch.services) {
      const svc = svcMap.get(svcId)
      if (!svc) continue
      rawNodes.push({
        id: svc.id,
        type: 'service',
        position: { x: 0, y: 0 },
        data: {
          serviceId: svc.id,
          name: svc.name,
          category: svc.cat,
          role: getServiceRole(arch.id, svc.id),
        },
      })
    }

    const rawEdges: Edge[] = arch.edges.map((e, i) => ({
      id: `e-${e.source}-${e.target}-${i}`,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: true,
      style: { stroke: '#6b7084', strokeWidth: 1.5 },
      labelStyle: {
        fill: '#9ea3b5',
        fontSize: 10,
        fontWeight: 500,
      },
      labelBgStyle: {
        fill: '#171a24',
        fillOpacity: 0.85,
      },
      labelBgPadding: [6, 3] as [number, number],
      labelBgBorderRadius: 4,
    }))

    return getLayoutedElements(rawNodes, rawEdges)
  }, [arch])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialData.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData.edges)

  // Sync when architecture changes
  useEffect(() => {
    setNodes(initialData.nodes)
    setEdges(initialData.edges)
  }, [initialData, setNodes, setEdges])

  // Update selected state on nodes when selection changes
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          selected: n.data.serviceId === selectedServiceId,
        },
      })),
    )
  }, [selectedServiceId, setNodes])

  const onInit = useCallback((instance: ReactFlowInstance<ServiceNodeType, Edge>) => {
    setTimeout(() => instance.fitView(), 50)
  }, [])

  if (!arch) {
    return (
      <div
        className="flex items-center justify-center h-full text-sm"
        style={{ color: 'var(--text3)' }}
      >
        Architecture not found
      </div>
    )
  }

  return (
    <div className="w-full h-full" style={{ minHeight: 400 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={onInit}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        minZoom={0.3}
        maxZoom={2}
        defaultEdgeOptions={{ animated: true }}
        style={{ background: '#0f1117' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#2a2e3d"
        />
        <Controls
          position="bottom-right"
          showInteractive={false}
          style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 8,
          }}
        />
      </ReactFlow>
    </div>
  )
}
