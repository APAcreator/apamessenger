const mongoose = require('mongoose');
module.exports = mongoose.model('Chat', new mongoose.Schema({
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}));
