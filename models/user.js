var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
  username: String,
  email: String,
  password: String
});
var User = mongoose.model('User', schema);

// Example method
exports.create = function() {
  // Write method here
};
