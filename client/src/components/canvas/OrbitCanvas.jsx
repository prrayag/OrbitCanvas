import { useCallback, useMemo, useEffect, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import OrbitNode from './OrbitNode';
import CursorOverlay from './CursorOverlay';
import { useCanvasSync } from '../../hooks/useCanvasSync';
import { generateNodeId, generateEdgeId } from '../../utils/nodePositioning';

const NODE_TYPES = { orbitNode: OrbitNode };

const DEFAULT_EDGE_OPTIONS = {
  type: 'smoothstep',
  animated: true,
  style: { stroke: 'rgba(0, 212, 255, 0.4)', strokeWidth: 2 },
};

function CanvasInner({ boardId, currentUser, initialNodes, initialEdges }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowInstance = useReactFlow();
  const saveTimeout = useRef(null);
  const reactFlowWrapper = useRef(null);

  const {
    emitNodeDrag,
    emitNodeTextUpdate,
    emitNodeAdd,
    emitNodeDelete,
    emitEdgeConnect,
    emitPointerMove,
    emitAIGenerate,
    saveCanvas,
    setupListeners,
    remoteCursors,
    streamingNodes,
    aiGenerating,
  } = useCanvasSync(boardId);

  // --- Auto-save debounced ---
  const scheduleSave = useCallback(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      const currentNodes = reactFlowInstance.getNodes();
      const currentEdges = reactFlowInstance.getEdges();
      saveCanvas(currentNodes, currentEdges);
    }, 2000);
  }, [saveCanvas, reactFlowInstance]);

  // --- Node callbacks for child components ---
  const handleTextChange = useCallback((nodeId, label) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, label } } : n
      )
    );
    emitNodeTextUpdate(nodeId, label);
    scheduleSave();
  }, [setNodes, emitNodeTextUpdate, scheduleSave]);

  const handleDelete = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    emitNodeDelete(nodeId);
    scheduleSave();
  }, [setNodes, setEdges, emitNodeDelete, scheduleSave]);

  const handleAIGenerate = useCallback((nodeId, text, actionType) => {
    const node = reactFlowInstance.getNodes().find((n) => n.id === nodeId);
    if (node) {
      emitAIGenerate(nodeId, text, node.position, actionType);
    }
  }, [reactFlowInstance, emitAIGenerate]);

  // Enrich nodes with callbacks and streaming state
  const enrichedNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      dragHandle: '.orbit-drag-handle',
      data: {
        ...node.data,
        onTextChange: handleTextChange,
        onDelete: handleDelete,
        onAIGenerate: handleAIGenerate,
        isStreaming: streamingNodes.has(node.id),
      },
    }));
  }, [nodes, handleTextChange, handleDelete, handleAIGenerate, streamingNodes]);

  // --- Socket Listeners ---
  useEffect(() => {
    const cleanup = setupListeners({
      onNodeDrag: (nodeId, position) => {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === nodeId ? { ...n, position } : n
          )
        );
      },
      onNodeTextUpdate: (nodeId, label) => {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === nodeId ? { ...n, data: { ...n.data, label } } : n
          )
        );
      },
      onNodeAdd: (node) => {
        setNodes((nds) => {
          if (nds.some((n) => n.id === node.id)) return nds;
          return [...nds, node];
        });
      },
      onNodeDelete: (nodeId) => {
        setNodes((nds) => nds.filter((n) => n.id !== nodeId));
        setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      },
      onEdgeConnect: (edge) => {
        setEdges((eds) => {
          if (eds.some((e) => e.id === edge.id)) return eds;
          return [...eds, edge];
        });
      },
      onAINodesCreated: (data) => {
        setNodes((nds) => {
          const newNodes = data.childNodes
            .filter((cn) => !nds.some((n) => n.id === cn.id))
            .map((cn) => ({
              ...cn,
              dragHandle: '.orbit-drag-handle',
              data: { ...cn.data, isStreaming: true },
            }));
          return [...nds, ...newNodes];
        });
        setEdges((eds) => {
          const newEdges = data.childEdges.filter(
            (ce) => !eds.some((e) => e.id === ce.id)
          );
          return [...eds, ...newEdges];
        });
      },
      onAIStreamEnd: (data) => {
        setNodes((nds) =>
          nds.map((n) => {
            const updated = data.childNodes.find((cn) => cn.id === n.id);
            if (updated) {
              return {
                ...n,
                data: { ...updated.data, isStreaming: false },
              };
            }
            return n;
          })
        );
        scheduleSave();
      },
    });

    return cleanup;
  }, [setupListeners, setNodes, setEdges, scheduleSave]);

  // --- Double-click on pane to spawn node ---
  const handlePaneClick = useCallback((event) => {
    // Only trigger on double click
    if (event.detail !== 2) return;
    
    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const newNode = {
      id: generateNodeId(),
      type: 'orbitNode',
      position,
      dragHandle: '.orbit-drag-handle',
      data: { label: '' },
    };

    setNodes((nds) => [...nds, newNode]);
    emitNodeAdd(newNode);
    scheduleSave();
  }, [reactFlowInstance, setNodes, emitNodeAdd, scheduleSave]);

  // --- Edge connection ---
  const onConnect = useCallback((params) => {
    const edge = {
      ...params,
      id: generateEdgeId(),
    };
    setEdges((eds) => addEdge(edge, eds));
    emitEdgeConnect(edge);
    scheduleSave();
  }, [setEdges, emitEdgeConnect, scheduleSave]);

  // --- Node drag for sync ---
  const onNodeDrag = useCallback((event, node) => {
    emitNodeDrag(node.id, node.position);
  }, [emitNodeDrag]);

  const onNodeDragStop = useCallback(() => {
    scheduleSave();
  }, [scheduleSave]);

  // --- Mouse move for cursor sync ---
  const handleMouseMove = useCallback((event) => {
    if (!currentUser) return;
    try {
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      emitPointerMove(position.x, position.y, currentUser.name, currentUser.color);
    } catch (e) {
      // ignore if react flow not ready
    }
  }, [reactFlowInstance, emitPointerMove, currentUser]);

  return (
    <div ref={reactFlowWrapper} className="relative w-full h-full">
      <ReactFlow
        nodes={enrichedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onPaneClick={handlePaneClick}
        onMouseMove={handleMouseMove}
        nodeTypes={NODE_TYPES}
        defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
        colorMode="light"
        fitView
        minZoom={0.1}
        maxZoom={2}
        connectionLineStyle={{ stroke: 'rgba(220, 38, 38, 0.5)', strokeWidth: 2 }}
        snapToGrid
        snapGrid={[16, 16]}
        deleteKeyCode={['Backspace', 'Delete']}
        selectionKeyCode={['Shift']}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1.5}
          color="rgba(0, 0, 0, 0.12)"
        />
        <Controls
          position="bottom-left"
          showInteractive={false}
        />
        <MiniMap
          position="bottom-right"
          nodeColor={() => 'rgba(255, 77, 45, 0.5)'}
          maskColor="rgba(0, 0, 0, 0.6)"
          maskStrokeColor="rgba(255, 255, 255, 0.1)"
          maskStrokeWidth={1}
          style={{ width: 140, height: 100, backgroundColor: '#1c1c1c' }}
          className="!border-white/[0.06] rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        />
      </ReactFlow>

      {/* Remote Cursors */}
      <CursorOverlay cursors={remoteCursors} />

      {/* AI Generating Indicator */}
      {aiGenerating && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="flex items-center gap-2 px-4 py-2 bg-orbit-card/90 backdrop-blur-xl border border-orbit-accent/30 rounded-full shadow-glow-accent">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-orbit-accent animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-orbit-accent animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-orbit-accent animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs font-mono text-orbit-accent">AI generating nodes...</span>
          </div>
        </div>
      )}

      {/* Empty State Placeholder */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-30">
          <div className="w-16 h-16 mb-4 border-2 border-dashed border-black/20 rounded-2xl flex items-center justify-center text-black/20">
            <span className="text-3xl font-light">+</span>
          </div>
          <p className="text-black/50 font-medium tracking-wide">Double-click anywhere to add a node</p>
          <p className="text-black/30 text-sm mt-2">Build your canvas</p>
        </div>
      )}
    </div>
  );
}

export default function OrbitCanvas({ boardId, currentUser, initialNodes, initialEdges }) {
  return (
    <ReactFlowProvider>
      <CanvasInner
        boardId={boardId}
        currentUser={currentUser}
        initialNodes={initialNodes || []}
        initialEdges={initialEdges || []}
      />
    </ReactFlowProvider>
  );
}
