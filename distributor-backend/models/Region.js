const mongoose = require("mongoose");

const regionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true }
});

module.exports = mongoose.model("Region", regionSchema);
