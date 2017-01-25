var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Local = new Schema({
  local_id: String,
  users: [],
  people_going: Number
});

module.exports = mongoose.model('Local', Local);