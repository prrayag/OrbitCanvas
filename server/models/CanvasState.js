const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, default: 'orbitNode' },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  data: {
    label: { type: String, default: '' },
  },
}, { _id: false });

const edgeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  source: { type: String, required: true },
  target: { type: String, required: true },
}, { _id: false });

const canvasStateSchema = new mongoose.Schema({
  boardId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  nodes: [nodeSchema],
  edges: [edgeSchema],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-update timestamp on save
canvasStateSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('CanvasState', canvasStateSchema);
