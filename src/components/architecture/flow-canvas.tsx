import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { MeshGradient } from '@paper-design/shaders-react'

import { ServiceNode, type ServiceNodeType } from './service-node'
import { ParticleEdge } from './particle-edge'
import { FlowContext } from './flow-context'
import { AmbientParticles } from './ambient-particles'
import { ARCHITECTURES } from '#/data/architectures'
import { SERVICES } from '#/data/services'
import { useExplorerStore } from '#/stores/explorer-store'
import { getTheme } from '#/lib/theme'
import type { Architecture, ArchitectureEdge, CostBreakdownRow, NormalizedTraffic } from '#/data/types'

import '@xyflow/react/dist/style.css'

// -- Constants ----
const NODE_WIDTH = 170
const NODE_HEIGHT = 80

const nodeTypes = { service: ServiceNode }
const edgeTypes = { default: ParticleEdge }

// -- Normalize traffic (same as cost-breakdown) ----
function normalizeTraffic(traffic: {
  rps: number
  storage: number
  aiCalls: number
  tenants: number
}): NormalizedTraffic {
  return {
    r: (traffic.rps * 86400 * 30) / 1e6,
    s: traffic.storage,
    ai: (traffic.aiCalls * 30) / 1e3,
    t: traffic.tenants,
  }
}

// -- Dagre layout helper ----
function getLayoutedElements(
  nodes: ServiceNodeType[],
  edges: Edge[],
): { nodes: ServiceNodeType[]; edges: Edge[] } {
  const g = new Graph()
  g.setGraph({ rankdir: 'LR', nodesep: 60, ranksep: 120, marginx: 50, marginy: 50 })
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

// -- Derive role for a service in an architecture ----
function getServiceRole(archId: string, serviceId: string): string {
  const arch = ARCHITECTURES.find((a: Architecture) => a.id === archId)
  if (!arch) return ''
  const edge = arch.edges.find(
    (e: ArchitectureEdge) => e.source === serviceId || e.target === serviceId,
  )
  return edge?.label ?? ''
}

// -- Compute cost weights per service (0-1 share of total cost) ----
function computeCostWeights(
  arch: Architecture,
  traffic: { rps: number; storage: number; aiCalls: number; tenants: number },
): Record<string, number> {
  const n = normalizeTraffic(traffic)
  const rows = arch.costBreakdown(n.r, n.s, n.ai, n.t)
  const total = rows.reduce((sum: number, row: CostBreakdownRow) => sum + row.estimated, 0)
  if (total <= 0) return {}

  // Map service names from cost rows to service IDs
  const weights: Record<string, number> = {}
  for (const row of rows) {
    // Match cost row service name to our service IDs (case-insensitive partial match)
    const serviceName = row.service.toLowerCase().replace(/\s+/g, '')
    for (const svcId of arch.services) {
      const svc = SERVICES[svcId]
      if (!svc) continue
      const svcNameNorm = svc.name.toLowerCase().replace(/\s+/g, '')
      if (svcNameNorm.includes(serviceName) || serviceName.includes(svcNameNorm)) {
        // Take the max weight if a service appears in multiple rows
        const w = row.estimated / total
        weights[svcId] = Math.max(weights[svcId] ?? 0, w)
      }
    }
  }
  return weights
}

// -- Component ----
interface FlowCanvasProps {
  architectureId: string
}

export function FlowCanvas({ architectureId }: FlowCanvasProps) {
  const selectedServiceId = useExplorerStore((s) => s.selectedService)
  const rps = useExplorerStore((s) => s.rps)
  const storage = useExplorerStore((s) => s.storage)
  const aiCalls = useExplorerStore((s) => s.aiCalls)
  const tenants = useExplorerStore((s) => s.tenants)

  // -- Hover state (local, not Zustand) ----
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  // -- Mouse position for parallax (normalized 0-1) ----
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })

  const arch = useMemo(
    () => ARCHITECTURES.find((a: Architecture) => a.id === architectureId),
    [architectureId],
  )

  // Compute cost weights reactively
  const costWeights = useMemo(() => {
    if (!arch) return {}
    return computeCostWeights(arch, { rps, storage, aiCalls, tenants })
  }, [arch, rps, storage, aiCalls, tenants])

  // Build nodes from architecture services
  const initialData = useMemo(() => {
    if (!arch) return { nodes: [] as ServiceNodeType[], edges: [] as Edge[] }

    const rawNodes: ServiceNodeType[] = []
    for (const svcId of arch.services) {
      const svc = SERVICES[svcId]
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
          costWeight: costWeights[svc.id] ?? 0,
        },
      })
    }

    const rawEdges: Edge[] = arch.edges.map((e: ArchitectureEdge, i: number) => ({
      id: `e-${e.source}-${e.target}-${i}`,
      source: e.source,
      target: e.target,
      label: e.label,
      type: 'default',
    }))

    return getLayoutedElements(rawNodes, rawEdges)
  }, [arch, costWeights])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialData.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData.edges)

  // -- Compute connected nodes and edges from hover ----
  const { connectedNodes, connectedEdges } = useMemo(() => {
    if (!hoveredNode) return { connectedNodes: new Set<string>(), connectedEdges: new Set<string>() }

    const cNodes = new Set<string>()
    const cEdges = new Set<string>()
    cNodes.add(hoveredNode)

    for (const edge of edges) {
      if (edge.source === hoveredNode || edge.target === hoveredNode) {
        cEdges.add(edge.id)
        cNodes.add(edge.source)
        cNodes.add(edge.target)
      }
    }

    return { connectedNodes: cNodes, connectedEdges: cEdges }
  }, [hoveredNode, edges])

  // Sync when architecture changes
  useEffect(() => {
    setNodes(initialData.nodes)
    setEdges(initialData.edges)
  }, [initialData, setNodes, setEdges])

  // Update selected state and cost weights on nodes when they change
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          selected: n.data.serviceId === selectedServiceId,
          costWeight: costWeights[n.data.serviceId] ?? 0,
        },
      })),
    )
  }, [selectedServiceId, costWeights, setNodes])

  const onInit = useCallback((_instance: ReactFlowInstance<ServiceNodeType, Edge>) => {
    setTimeout(() => _instance.fitView(), 50)
  }, [])

  // -- Node hover handlers ----
  const handleNodeMouseEnter = useCallback((_: React.MouseEvent, node: ServiceNodeType) => {
    setHoveredNode(node.id)
    document.body.classList.add('cursor-on-node')
  }, [])

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNode(null)
    document.body.classList.remove('cursor-on-node')
  }, [])

  // -- Mouse move handler for parallax ----
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    })
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

  const isLight = getTheme() === 'light'

  return (
    <FlowContext.Provider value={{ hoveredNode, connectedNodes, connectedEdges, mousePos }}>
      <div
        className="w-full h-full flow-canvas-area"
        style={{ position: 'relative', minHeight: 400, cursor: 'none' }}
        onMouseMove={handleMouseMove}
      >
        {/* Ambient floating particles — behind everything */}
        <AmbientParticles />

        {/* Paper Shaders MeshGradient background — ambient, non-interactive */}
        <div
          className="shader-bg"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        >
          <MeshGradient
            color1={isLight ? '#ea580c' : '#f97316'}
            color2={isLight ? '#0891b2' : '#06b6d4'}
            color3={isLight ? '#d6d3d1' : '#7c3aed'}
            color4={isLight ? '#fafaf9' : '#050508'}
            speed={0.15}
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* React Flow on top */}
        <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onInit={onInit}
            onNodeMouseEnter={handleNodeMouseEnter}
            onNodeMouseLeave={handleNodeMouseLeave}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            proOptions={{ hideAttribution: true }}
            minZoom={0.3}
            maxZoom={2}
            style={{
              background: 'transparent',
            }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1}
              color={isLight ? 'rgba(168, 162, 158, 0.35)' : 'rgba(63, 63, 70, 0.4)'}
            />
            <Controls
              position="bottom-right"
              showInteractive={false}
            />
          </ReactFlow>
        </div>
      </div>
    </FlowContext.Provider>
  )
}
