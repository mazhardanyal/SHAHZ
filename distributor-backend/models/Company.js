const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  companyId: { type: String, unique: true },
  name: { type: String, required: true },
  address: String,
  contactNo: String,
  email: String,
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true
});

module.exports = mongoose.model('Company', companySchema);
