var mongoose = require('mongoose');
var history = new mongoose.Schema({}, {
  strict: false,
  collection: 'history'
});

module.exports = mongoose.model('history', history);