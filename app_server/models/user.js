var mongoose = require('mongoose');
var users = new mongoose.Schema({

  message: String,
  user: String,
  token: String

}, {
  strict: false,
  collection: 'users'
});

module.exports = mongoose.model('users', users);