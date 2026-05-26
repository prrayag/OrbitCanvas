import { useCallback, useEffect, useRef, useState } from 'react';
import socket from '../socket';

/**
 * Hook for bidirectional canvas state synchronization via Socket.io.
 * Handles node/edge changes, AI streaming, and remote cursor tracking.
 */
export function useCanvasSync(boardId) {
  const [remoteCursors, setRemoteCursors] = useState({});
  const [streamingNodes, setStreamingNodes] = useState(new Set());
  const [aiGenerating, setAiGenerating] = useState(false);

  // Refs for throttling
  const lastPointerEmit = useRef(0);
  const lastDragEmit = useRef(0);

  // --- Outbound: Emit events ---

  const emitNodeDrag = useCallback((nodeId, position) => {
    const now = Date.now();
    if (now - lastDragEmit.current < 30) return; // throttle to ~33fps
    lastDragEmit.current = now;
    socket.emit('node-drag', { nodeId, position });
  }, []);

  const emitNodeTextUpdate = useCallback((nodeId, label) => {
    socket.emit('node-text-update', { nodeId, label });
  }, []);

  const emitNodeAdd = useCallback((node) => {
    socket.emit('node-add', { node });
  }, []);

  const emitNodeDelete = useCallback((nodeId) => {
    socket.emit('node-delete', { nodeId });
  }, []);

  const emitEdgeConnect = useCallback((edge) => {
    socket.emit('edge-connect', { edge });
  }, []);

  const emitPointerMove = useCallback((x, y, userName, userColor) => {
    const now = Date.now();
    if (now - lastPointerEmit.current < 50) return; // throttle to 20fps
    lastPointerEmit.current = now;
    socket.emit('mouse-pointer-move', { x, y, userName, userColor });
  }, []);

  const emitAIGenerate = useCallback((parentNodeId, parentText, parentPosition, actionType) => {
    setAiGenerating(true);
    socket.emit('ai-generate', { parentNodeId, parentText, parentPosition, actionType });
  }, []);

  const saveCanvas = useCallback((nodes, edges) => {
    socket.emit('save-canvas', { nodes, edges });
  }, []);

  // --- Inbound: Setup listeners (returns cleanup) ---

  const setupListeners = useCallback((handlers) => {
    const {
      onNodeDrag,
      onNodeTextUpdate,
      onNodeAdd,
      onNodeDelete,
      onEdgeConnect,
      onAINodesCreated,
      onAIStreamEnd,
    } = handlers;

    const handleNodeDrag = (data) => {
      if (data.userId === socket.id) return;
      onNodeDrag?.(data.nodeId, data.position);
    };

    const handleNodeTextUpdate = (data) => {
      if (data.userId === socket.id) return;
      onNodeTextUpdate?.(data.nodeId, data.label);
    };

    const handleNodeAdd = (data) => {
      if (data.userId === socket.id) return;
      onNodeAdd?.(data.node);
    };

    const handleNodeDelete = (data) => {
      if (data.userId === socket.id) return;
      onNodeDelete?.(data.nodeId);
    };

    const handleEdgeConnect = (data) => {
      if (data.userId === socket.id) return;
      onEdgeConnect?.(data.edge);
    };

    const handleMousePointer = (data) => {
      if (data.userId === socket.id) return;
      setRemoteCursors((prev) => ({
        ...prev,
        [data.userId]: {
          x: data.x,
          y: data.y,
          userName: data.userName,
          userColor: data.userColor,
        },
      }));
    };

    const handleUserLeft = (data) => {
      setRemoteCursors((prev) => {
        const next = { ...prev };
        delete next[data.id];
        return next;
      });
    };

    const handleAINodesCreated = (data) => {
      const nodeIds = new Set(data.childNodes.map((n) => n.id));
      setStreamingNodes(nodeIds);
      onAINodesCreated?.(data);
    };

    const handleAIStreamChunk = () => {
      // Chunks are handled by ai-stream-end which has final data
      // We keep this for potential real-time text rendering in future
    };

    const handleAIStreamEnd = (data) => {
      setStreamingNodes(new Set());
      setAiGenerating(false);
      onAIStreamEnd?.(data);
    };

    socket.on('node-drag', handleNodeDrag);
    socket.on('node-text-update', handleNodeTextUpdate);
    socket.on('node-add', handleNodeAdd);
    socket.on('node-delete', handleNodeDelete);
    socket.on('edge-connect', handleEdgeConnect);
    socket.on('mouse-pointer-move', handleMousePointer);
    socket.on('user-left', handleUserLeft);
    socket.on('ai-nodes-created', handleAINodesCreated);
    socket.on('ai-stream-chunk', handleAIStreamChunk);
    socket.on('ai-stream-end', handleAIStreamEnd);

    return () => {
      socket.off('node-drag', handleNodeDrag);
      socket.off('node-text-update', handleNodeTextUpdate);
      socket.off('node-add', handleNodeAdd);
      socket.off('node-delete', handleNodeDelete);
      socket.off('edge-connect', handleEdgeConnect);
      socket.off('mouse-pointer-move', handleMousePointer);
      socket.off('user-left', handleUserLeft);
      socket.off('ai-nodes-created', handleAINodesCreated);
      socket.off('ai-stream-chunk', handleAIStreamChunk);
      socket.off('ai-stream-end', handleAIStreamEnd);
    };
  }, []);

  return {
    // Emitters
    emitNodeDrag,
    emitNodeTextUpdate,
    emitNodeAdd,
    emitNodeDelete,
    emitEdgeConnect,
    emitPointerMove,
    emitAIGenerate,
    saveCanvas,
    // Listeners setup
    setupListeners,
    // State
    remoteCursors,
    streamingNodes,
    aiGenerating,
  };
}
