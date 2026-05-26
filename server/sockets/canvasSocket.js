const { v4: uuidv4 } = require('uuid');
const { streamBrainstorm, parseAIResponse } = require('../services/geminiService');
const CanvasState = require('../models/CanvasState');

// Track active users per room
const roomUsers = new Map();

/**
 * Calculate child node positions in a radial arc below the parent.
 */
function calculateChildPositions(parentPos, count = 4) {
  const radius = 280;
  const arcSpread = Math.PI * 0.7; // ~126 degrees
  const startAngle = Math.PI / 2 - arcSpread / 2; // centered below

  const positions = [];
  for (let i = 0; i < count; i++) {
    const angle = startAngle + (arcSpread / (count - 1 || 1)) * i;
    positions.push({
      x: parentPos.x + radius * Math.cos(angle) - 100,
      y: parentPos.y + radius * Math.sin(angle) + 80,
    });
  }
  return positions;
}

/**
 * Save current canvas state to MongoDB (fire-and-forget).
 */
async function persistCanvasState(boardId, nodes, edges) {
  try {
    await CanvasState.findOneAndUpdate(
      { boardId },
      { nodes, edges, updatedAt: Date.now() },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error('✦ Failed to persist canvas state:', err.message);
  }
}

function setupCanvasSocket(io) {
  io.on('connection', (socket) => {
    console.log(`✦ Socket connected: ${socket.id}`);

    let currentRoom = null;
    let userId = null;

    // --- Join Board Room ---
    socket.on('join-board', (data) => {
      const { boardId, userName, userColor } = data;
      currentRoom = boardId;
      userId = socket.id;

      socket.join(boardId);

      // Track user in room
      if (!roomUsers.has(boardId)) {
        roomUsers.set(boardId, new Map());
      }
      roomUsers.get(boardId).set(socket.id, {
        id: socket.id,
        name: userName || `User-${socket.id.slice(0, 4)}`,
        color: userColor || '#ff4d2d',
      });

      // Notify room of new user
      const users = Array.from(roomUsers.get(boardId).values());
      io.to(boardId).emit('room-users', users);
      socket.to(boardId).emit('user-joined', {
        id: socket.id,
        name: userName || `User-${socket.id.slice(0, 4)}`,
      });

      console.log(`✦ ${socket.id} joined room: ${boardId}`);
    });

    // --- Node Drag (position update) ---
    socket.on('node-drag', (data) => {
      if (!currentRoom) return;
      socket.to(currentRoom).emit('node-drag', {
        nodeId: data.nodeId,
        position: data.position,
        userId: socket.id,
      });
    });

    // --- Node Text Update ---
    socket.on('node-text-update', (data) => {
      if (!currentRoom) return;
      socket.to(currentRoom).emit('node-text-update', {
        nodeId: data.nodeId,
        label: data.label,
        userId: socket.id,
      });
    });

    // --- Node Add ---
    socket.on('node-add', (data) => {
      if (!currentRoom) return;
      socket.to(currentRoom).emit('node-add', {
        node: data.node,
        userId: socket.id,
      });
    });

    // --- Node Delete ---
    socket.on('node-delete', (data) => {
      if (!currentRoom) return;
      socket.to(currentRoom).emit('node-delete', {
        nodeId: data.nodeId,
        userId: socket.id,
      });
    });

    // --- Edge Connect ---
    socket.on('edge-connect', (data) => {
      if (!currentRoom) return;
      socket.to(currentRoom).emit('edge-connect', {
        edge: data.edge,
        userId: socket.id,
      });
    });

    // --- Mouse Pointer Move (already throttled on client) ---
    socket.on('mouse-pointer-move', (data) => {
      if (!currentRoom) return;
      socket.to(currentRoom).emit('mouse-pointer-move', {
        userId: socket.id,
        x: data.x,
        y: data.y,
        userName: data.userName,
        userColor: data.userColor,
      });
    });

    // --- Save Canvas State ---
    socket.on('save-canvas', async (data) => {
      if (!currentRoom) return;
      await persistCanvasState(currentRoom, data.nodes, data.edges);
    });

    // --- AI Generate (Streaming) ---
    socket.on('ai-generate', async (data) => {
      if (!currentRoom) return;

      const { parentNodeId, parentText, parentPosition, actionType } = data;

      // Create placeholder child nodes
      const childCount = 4;
      const childPositions = calculateChildPositions(parentPosition, childCount);
      const childNodes = childPositions.map((pos, i) => ({
        id: `ai-${uuidv4().slice(0, 8)}`,
        type: 'orbitNode',
        position: pos,
        data: { label: '' },
      }));

      // Create edges from parent to children
      const childEdges = childNodes.map((child) => ({
        id: `edge-${uuidv4().slice(0, 8)}`,
        source: parentNodeId,
        target: child.id,
      }));

      // Emit placeholder nodes immediately
      io.to(currentRoom).emit('ai-nodes-created', {
        parentNodeId,
        childNodes,
        childEdges,
      });

      try {
        // Stream from Gemini
        let fullText = '';
        await streamBrainstorm(parentText, actionType, (chunk) => {
          fullText += chunk;
          // Send raw stream chunks to clients
          io.to(currentRoom).emit('ai-stream-chunk', {
            parentNodeId,
            chunk,
            fullText,
          });
        });

        // Parse final response and populate child nodes
        const ideas = parseAIResponse(fullText);
        const populatedChildren = childNodes.map((node, i) => ({
          ...node,
          data: {
            label: ideas[i]
              ? `${ideas[i].title}\n${ideas[i].description}`
              : 'Generated idea',
          },
        }));

        io.to(currentRoom).emit('ai-stream-end', {
          parentNodeId,
          childNodes: populatedChildren,
          childEdges,
        });
      } catch (error) {
        console.error('✦ AI generation error:', error.message);
        // Populate with error fallback
        const fallbackChildren = childNodes.map((node, i) => ({
          ...node,
          data: { label: `Idea ${i + 1}\nAI generation failed. Try again.` },
        }));

        io.to(currentRoom).emit('ai-stream-end', {
          parentNodeId,
          childNodes: fallbackChildren,
          childEdges,
          error: error.message,
        });
      }
    });

    // --- Disconnect ---
    socket.on('disconnect', () => {
      console.log(`✦ Socket disconnected: ${socket.id}`);

      if (currentRoom && roomUsers.has(currentRoom)) {
        roomUsers.get(currentRoom).delete(socket.id);
        const users = Array.from(roomUsers.get(currentRoom).values());
        io.to(currentRoom).emit('room-users', users);
        socket.to(currentRoom).emit('user-left', { id: socket.id });

        // Clean up empty rooms
        if (roomUsers.get(currentRoom).size === 0) {
          roomUsers.delete(currentRoom);
        }
      }
    });
  });
}

module.exports = setupCanvasSocket;
