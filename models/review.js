var mongoose = require("mongoose");
var reviewScheme = new mongoose.Schema({
  author:String,
  content:String,
});
module.exports = mongoose.model("Review",reviewScheme);
