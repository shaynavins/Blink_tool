import { useState } from 'react'
import './WorkflowBuilder.css'

const WorkflowBuilder = () => {
  const [nodes, setNodes] = useState([
    { id: 1, type: 'trigger', label: 'Webhook', icon: '🎯', x: 100, y: 200 },
    { id: 2, type: 'action', label: 'Transform', icon: '⚡', x: 300, y: 200 },
    { id: 3, type: 'integration', label: 'API Call', icon: '🔗', x: 500, y: 200 },
    { id: 4, type: 'output', label: 'Send Email', icon: '📧', x: 700, y: 200 },
  ])

  const [connections] = useState([
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 4 },
  ])

  const [selectedNode, setSelectedNode] = useState(null)
  const [hoveredNode, setHoveredNode] = useState(null)

  const nodeTypes = {
    trigger: { color: '#ff6b6b', icon: '🎯', label: 'Trigger' },
    action: { color: '#4ecdc4', icon: '⚡', label: 'Action' },
    integration: { color: '#45b7d1', icon: '🔗', label: 'Integration' },
    output: { color: '#96ceb4', icon: '✓', label: 'Output' },
  }

  return (
    <div className="workflow-builder">
      <div className="workflow-sidebar">
        <h3>Add Node</h3>
        {Object.entries(nodeTypes).map(([type, config]) => (
          <div key={type} className="sidebar-node" draggable>
            <span className="sidebar-node-icon">{config.icon}</span>
            <span className="sidebar-node-label">{config.label}</span>
          </div>
        ))}
        
        <div className="workflow-controls">
          <button className="control-btn">
            <span>🔍</span> Zoom In
          </button>
          <button className="control-btn">
            <span>🔍</span> Zoom Out
          </button>
          <button className="control-btn">
            <span>⚙️</span> Settings
          </button>
        </div>
      </div>

      <div className="workflow-canvas-container">
        <div className="canvas-toolbar">
          <button className="toolbar-btn active">
            <span>✋</span> Select
          </button>
          <button className="toolbar-btn">
            <span>➕</span> Add Node
          </button>
          <button className="toolbar-btn">
            <span>🔗</span> Connect
          </button>
          <button className="toolbar-btn">
            <span>▶️</span> Execute
          </button>
        </div>

        <svg className="workflow-canvas" width="100%" height="600">
          {/* Grid Background */}
          <defs>
            <pattern
              id="grid"
              width="30"
              height="30"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 30 0 L 0 0 0 30"
                fill="none"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Connections */}
          {connections.map((conn, idx) => {
            const fromNode = nodes.find((n) => n.id === conn.from)
            const toNode = nodes.find((n) => n.id === conn.to)
            if (!fromNode || !toNode) return null

            return (
              <g key={idx}>
                <path
                  d={`M ${fromNode.x + 60} ${fromNode.y} L ${toNode.x - 60} ${toNode.y}`}
                  stroke="url(#connection-gradient)"
                  strokeWidth="3"
                  fill="none"
                  className="connection-line"
                />
                <circle
                  cx={toNode.x - 60}
                  cy={toNode.y}
                  r="4"
                  fill="#ff6b6b"
                />
              </g>
            )
          })}

          <defs>
            <linearGradient id="connection-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#ff6b6b', stopOpacity: 0.6 }} />
              <stop offset="100%" style={{ stopColor: '#4ecdc4', stopOpacity: 0.6 }} />
            </linearGradient>
          </defs>

          {/* Nodes */}
          {nodes.map((node) => (
            <g
              key={node.id}
              transform={`translate(${node.x - 60}, ${node.y - 40})`}
              className={`workflow-node ${selectedNode === node.id ? 'selected' : ''} ${hoveredNode === node.id ? 'hovered' : ''}`}
              onClick={() => setSelectedNode(node.id)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: 'pointer' }}
            >
              <rect
                width="120"
                height="80"
                rx="12"
                fill={nodeTypes[node.type]?.color || '#333'}
                fillOpacity="0.2"
                stroke={nodeTypes[node.type]?.color || '#666'}
                strokeWidth="2"
                className="node-rect"
              />
              <text
                x="60"
                y="35"
                textAnchor="middle"
                fontSize="24"
              >
                {node.icon}
              </text>
              <text
                x="60"
                y="60"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="12"
                fontWeight="600"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>

        {selectedNode && (
          <div className="node-inspector">
            <h4>Node Settings</h4>
            <div className="inspector-field">
              <label>Node Name</label>
              <input
                type="text"
                value={nodes.find((n) => n.id === selectedNode)?.label || ''}
                onChange={(e) => {
                  setNodes(
                    nodes.map((n) =>
                      n.id === selectedNode ? { ...n, label: e.target.value } : n
                    )
                  )
                }}
              />
            </div>
            <div className="inspector-field">
              <label>Node Type</label>
              <select
                value={nodes.find((n) => n.id === selectedNode)?.type || ''}
                onChange={(e) => {
                  setNodes(
                    nodes.map((n) =>
                      n.id === selectedNode ? { ...n, type: e.target.value } : n
                    )
                  )
                }}
              >
                {Object.entries(nodeTypes).map(([type, config]) => (
                  <option key={type} value={type}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="btn-delete"
              onClick={() => {
                setNodes(nodes.filter((n) => n.id !== selectedNode))
                setSelectedNode(null)
              }}
            >
              Delete Node
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkflowBuilder
