const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Board = require('../models/Board');
const CanvasState = require('../models/CanvasState');

const router = express.Router();

// POST /api/boards — Create a new board
router.post('/', async (req, res) => {
  try {
    const { title } = req.body;
    const board = new Board({ title: title || 'Untitled Board' });
    await board.save();

    // Create empty canvas state for the board
    const canvasState = new CanvasState({
      boardId: board._id.toString(),
      nodes: [],
      edges: [],
    });
    await canvasState.save();

    res.status(201).json({
      boardId: board._id.toString(),
      title: board.title,
      createdAt: board.createdAt,
    });
  } catch (error) {
    console.error('Error creating board:', error);
    res.status(500).json({ error: 'Failed to create board' });
  }
});

// GET /api/boards/:boardId — Get board metadata
router.get('/:boardId', async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    res.json(board);
  } catch (error) {
    console.error('Error fetching board:', error);
    res.status(500).json({ error: 'Failed to fetch board' });
  }
});

// PUT /api/boards/:boardId — Update board metadata
router.put('/:boardId', async (req, res) => {
  try {
    const { title } = req.body;
    const board = await Board.findByIdAndUpdate(
      req.params.boardId,
      { title },
      { new: true }
    );
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    res.json(board);
  } catch (error) {
    console.error('Error updating board:', error);
    res.status(500).json({ error: 'Failed to update board' });
  }
});

// GET /api/boards/:boardId/state — Get canvas state
router.get('/:boardId/state', async (req, res) => {
  try {
    let canvasState = await CanvasState.findOne({ boardId: req.params.boardId });
    if (!canvasState) {
      // Create empty state if none exists
      canvasState = new CanvasState({
        boardId: req.params.boardId,
        nodes: [],
        edges: [],
      });
      await canvasState.save();
    }
    res.json({
      nodes: canvasState.nodes,
      edges: canvasState.edges,
      updatedAt: canvasState.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching canvas state:', error);
    res.status(500).json({ error: 'Failed to fetch canvas state' });
  }
});

// PUT /api/boards/:boardId/state — Save canvas state
router.put('/:boardId/state', async (req, res) => {
  try {
    const { nodes, edges } = req.body;
    const canvasState = await CanvasState.findOneAndUpdate(
      { boardId: req.params.boardId },
      { nodes, edges, updatedAt: Date.now() },
      { upsert: true, new: true, runValidators: true }
    );
    res.json({
      nodes: canvasState.nodes,
      edges: canvasState.edges,
      updatedAt: canvasState.updatedAt,
    });
  } catch (error) {
    console.error('Error saving canvas state:', error);
    res.status(500).json({ error: 'Failed to save canvas state' });
  }
});

module.exports = router;
