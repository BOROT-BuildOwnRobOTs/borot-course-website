"use client"
import { X } from "lucide-react"
import { useCallback } from "react"
import {
  ReactFlow,
  type Node,
  type Edge,
  addEdge,
  ConnectionLineType,
  Panel,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

interface LearningFlowModalProps {
  isOpen: boolean
  onClose: () => void
}

const initialNodes: Node[] = [
  // Module 1 nodes
  {
    id: "module1",
    type: "input",
    position: { x: 50, y: 50 },
    data: {
      label: (
        <div className="text-center">
          <div className="font-bold text-blue-700">Module 1</div>
          <div className="text-xs">Math, Physics, Coding, CAD</div>
        </div>
      ),
    },
    style: {
      background: "#dbeafe",
      border: "2px solid #3b82f6",
      borderRadius: "12px",
      width: 180,
      fontSize: "12px",
    },
  },
  {
    id: "mechanical",
    position: { x: 300, y: 20 },
    data: { label: "Mechanical" },
    style: { background: "#f3f4f6", border: "1px solid #6b7280", borderRadius: "8px", width: 100 },
  },
  {
    id: "computer",
    position: { x: 300, y: 80 },
    data: { label: "Computer" },
    style: { background: "#f3f4f6", border: "1px solid #6b7280", borderRadius: "8px", width: 100 },
  },
  {
    id: "materials",
    position: { x: 420, y: 20 },
    data: { label: "Materials" },
    style: { background: "#f3f4f6", border: "1px solid #6b7280", borderRadius: "8px", width: 100 },
  },
  {
    id: "chemical",
    position: { x: 420, y: 80 },
    data: { label: "Chemical" },
    style: { background: "#f3f4f6", border: "1px solid #6b7280", borderRadius: "8px", width: 100 },
  },

  // Module 2 nodes
  {
    id: "module2",
    position: { x: 50, y: 200 },
    data: {
      label: (
        <div className="text-center">
          <div className="font-bold text-green-700">Module 2</div>
          <div className="text-xs">Control, Sensors, Navigation</div>
        </div>
      ),
    },
    style: {
      background: "#dcfce7",
      border: "2px solid #16a34a",
      borderRadius: "12px",
      width: 180,
      fontSize: "12px",
    },
  },
  {
    id: "electrical",
    position: { x: 300, y: 160 },
    data: {
      label: (
        <div className="text-center">
          <div className="font-semibold">Electrical</div>
          <div className="text-xs text-gray-600">Mechanical + Computer</div>
        </div>
      ),
    },
    style: { background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: "8px", width: 140 },
  },
  {
    id: "electronics",
    position: { x: 300, y: 220 },
    data: {
      label: (
        <div className="text-center">
          <div className="font-semibold">Electronics</div>
          <div className="text-xs text-gray-600">Electrical + Physics</div>
        </div>
      ),
    },
    style: { background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: "8px", width: 140 },
  },
  {
    id: "mechatronics",
    position: { x: 460, y: 160 },
    data: {
      label: (
        <div className="text-center">
          <div className="font-semibold">Mechatronics</div>
          <div className="text-xs text-gray-600">Mech + Elec + Comp</div>
        </div>
      ),
    },
    style: { background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: "8px", width: 140 },
  },
  {
    id: "telecom",
    position: { x: 460, y: 220 },
    data: {
      label: (
        <div className="text-center">
          <div className="font-semibold">Telecom</div>
          <div className="text-xs text-gray-600">Elec + Comp/Network</div>
        </div>
      ),
    },
    style: { background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: "8px", width: 140 },
  },

  // Module 3 nodes
  {
    id: "module3",
    position: { x: 50, y: 350 },
    data: {
      label: (
        <div className="text-center">
          <div className="font-bold text-purple-700">Module 3</div>
          <div className="text-xs">Vision, AI, Data</div>
        </div>
      ),
    },
    style: {
      background: "#f3e8ff",
      border: "2px solid #9333ea",
      borderRadius: "12px",
      width: 180,
      fontSize: "12px",
    },
  },
  {
    id: "computerai",
    position: { x: 300, y: 310 },
    data: {
      label: (
        <div className="text-center">
          <div className="font-semibold">Computer/AI</div>
          <div className="text-xs text-gray-600">Computer + Math/Stats</div>
        </div>
      ),
    },
    style: { background: "#e0e7ff", border: "1px solid #6366f1", borderRadius: "8px", width: 140 },
  },
  {
    id: "industrial",
    position: { x: 300, y: 370 },
    data: {
      label: (
        <div className="text-center">
          <div className="font-semibold">Industrial</div>
          <div className="text-xs text-gray-600">Mech + Control + AI</div>
        </div>
      ),
    },
    style: { background: "#e0e7ff", border: "1px solid #6366f1", borderRadius: "8px", width: 140 },
  },
  {
    id: "biomedical",
    position: { x: 460, y: 310 },
    data: {
      label: (
        <div className="text-center">
          <div className="font-semibold">Biomedical</div>
          <div className="text-xs text-gray-600">Elec + Materials + Vision</div>
        </div>
      ),
    },
    style: { background: "#e0e7ff", border: "1px solid #6366f1", borderRadius: "8px", width: 140 },
  },
  {
    id: "agriculture",
    position: { x: 460, y: 370 },
    data: {
      label: (
        <div className="text-center">
          <div className="font-semibold">Agriculture</div>
          <div className="text-xs text-gray-600">Sensors + AI + Mech</div>
        </div>
      ),
    },
    style: { background: "#e0e7ff", border: "1px solid #6366f1", borderRadius: "8px", width: 140 },
  },
  {
    id: "environmental",
    position: { x: 620, y: 340 },
    data: {
      label: (
        <div className="text-center">
          <div className="font-semibold">Environmental</div>
          <div className="text-xs text-gray-600">Physics + Sensors + Data</div>
        </div>
      ),
    },
    style: { background: "#e0e7ff", border: "1px solid #6366f1", borderRadius: "8px", width: 140 },
  },

  // Module 4 nodes
  {
    id: "module4",
    position: { x: 50, y: 500 },
    data: {
      label: (
        <div className="text-center">
          <div className="font-bold text-orange-700">Module 4</div>
          <div className="text-xs">Integration Project</div>
        </div>
      ),
    },
    style: {
      background: "#fed7aa",
      border: "2px solid #ea580c",
      borderRadius: "12px",
      width: 180,
      fontSize: "12px",
    },
  },
  {
    id: "robotics",
    position: { x: 300, y: 460 },
    data: {
      label: (
        <div className="text-center">
          <div className="font-semibold">Robotics</div>
          <div className="text-xs text-gray-600">All Modules Combined</div>
        </div>
      ),
    },
    style: { background: "#fecaca", border: "1px solid #ef4444", borderRadius: "8px", width: 140 },
  },
  {
    id: "advmechatronics",
    position: { x: 300, y: 520 },
    data: {
      label: (
        <div className="text-center">
          <div className="font-semibold">Adv Mechatronics</div>
          <div className="text-xs text-gray-600">Mechatronics + AI</div>
        </div>
      ),
    },
    style: { background: "#fecaca", border: "1px solid #ef4444", borderRadius: "8px", width: 140 },
  },
  {
    id: "innovation",
    position: { x: 460, y: 490 },
    data: {
      label: (
        <div className="text-center">
          <div className="font-semibold">Innovation</div>
          <div className="text-xs text-gray-600">All + Business + Design</div>
        </div>
      ),
    },
    style: { background: "#fecaca", border: "1px solid #ef4444", borderRadius: "8px", width: 140 },
  },
]

const initialEdges: Edge[] = [
  // Module 1 connections
  { id: "e1-1", source: "module1", target: "mechanical", markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "e1-2", source: "module1", target: "computer", markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "e1-3", source: "module1", target: "materials", markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "e1-4", source: "module1", target: "chemical", markerEnd: { type: MarkerType.ArrowClosed } },

  // Module 2 connections
  { id: "e2-1", source: "module2", target: "electrical", markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "e2-2", source: "module2", target: "electronics", markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "e2-3", source: "module2", target: "mechatronics", markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "e2-4", source: "module2", target: "telecom", markerEnd: { type: MarkerType.ArrowClosed } },

  // Module 3 connections
  { id: "e3-1", source: "module3", target: "computerai", markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "e3-2", source: "module3", target: "industrial", markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "e3-3", source: "module3", target: "biomedical", markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "e3-4", source: "module3", target: "agriculture", markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "e3-5", source: "module3", target: "environmental", markerEnd: { type: MarkerType.ArrowClosed } },

  // Module 4 connections
  { id: "e4-1", source: "module4", target: "robotics", markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "e4-2", source: "module4", target: "advmechatronics", markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "e4-3", source: "module4", target: "innovation", markerEnd: { type: MarkerType.ArrowClosed } },

  // Module progression connections
  {
    id: "prog1-2",
    source: "module1",
    target: "module2",
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: "#16a34a", strokeWidth: 3 },
  },
  {
    id: "prog2-3",
    source: "module2",
    target: "module3",
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: "#9333ea", strokeWidth: 3 },
  },
  {
    id: "prog3-4",
    source: "module3",
    target: "module4",
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: "#ea580c", strokeWidth: 3 },
  },
]

export function LearningFlowModal({ isOpen, onClose }: LearningFlowModalProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative bg-background border rounded-xl shadow-2xl max-w-6xl w-[95vw] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-background border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Learning Path 2025</h2>
            <p className="text-muted-foreground">แผนภาพการเรียนรู้และการเชื่อมโยงความรู้</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Flow Diagram */}
        <div className="h-[70vh]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            connectionLineType={ConnectionLineType.SmoothStep}
            fitView
            attributionPosition="bottom-left"
          >
            <Panel position="bottom-right" className="bg-background/80 backdrop-blur-sm p-4 rounded-lg border text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>พื้นฐาน</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>การเชื่อมโยง</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-indigo-500 rounded"></div>
                  <span>ขั้นสูง</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>บูรณาการ</span>
                </div>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {/* Summary */}
        <div className="p-4 bg-accent/5 border-t">
          <p className="text-sm text-muted-foreground text-center">
            <span className="font-medium">การเรียนรู้แบบสะสม:</span> แต่ละโมดูลสร้างพื้นฐานสำหรับโมดูลถัดไป
            และเปิดโอกาสในสาขาวิศวกรรมที่หลากหลายมากขึ้น
          </p>
        </div>
      </div>
    </div>
  )
}
