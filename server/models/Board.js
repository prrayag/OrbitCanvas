const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Untitled Board',
    trim: true,
    maxlength: 120,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  users: [{
    type: String,
  }],
});

module.exports = mongoose.model('Board', boardSchema);
