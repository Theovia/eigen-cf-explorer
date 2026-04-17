import { createContext, useContext } from 'react'

interface FlowContextType {
  hoveredNode: string | null
  connectedNodes: Set<string>
  connectedEdges: Set<string>
  mousePos: { x: number; y: number } // normalized 0-1
}

export const FlowContext = createContext<FlowContextType>({
  hoveredNode: null,
  connectedNodes: new Set(),
  connectedEdges: new Set(),
  mousePos: { x: 0.5, y: 0.5 },
})

export const useFlowContext = () => useContext(FlowContext)
