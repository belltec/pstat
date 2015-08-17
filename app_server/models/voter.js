var mongoose = require('mongoose');
var voter = new mongoose.Schema({}, {
  strict: false,
  collection: 'voters'
});

module.exports = mongoose.model('voter', voter);