const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  accountType: { type: String, required: true },
  accountCode: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  address: { type: String },
  contactNo: { type: String },
  cellNo: { type: String },
  region: { type: String },
  customerType: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

accountSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Account', accountSchema);