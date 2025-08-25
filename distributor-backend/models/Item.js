const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  unit: { type: String, default: '' },
  batchNo: { type: String, default: '' },
  expDate: { type: Date },
  unitPrice: { type: Number, default: 0 },
  subCompany: { type: String, default: '' },
  inactive: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Item', itemSchema);