const mongoose = require("mongoose");

const vanSchema = new mongoose.Schema({
  vanNumber: {
    type: String,
    required: true,
    unique: true,
  },
  plateNumber: {
    type: String,
    required: true,
  },
  image: {
    type: String, // Base64 or URL
    default: "",
  },
});

module.exports = mongoose.model("Van", vanSchema);
