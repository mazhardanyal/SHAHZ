const mongoose = require('mongoose');

const claimItemSchema = new mongoose.Schema({
  itemCode: String,
  description: String,
  unit: String,
  batchNo: String,
  expDate: String,
  qty: Number,
  damage: Number,
  claim: Number,
  return: Number,
  unitPrice: Number,
  sTax: Number,
  disc1: Number,
  disc2: Number,
  total: Number,
});

const claimSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true },
  invoiceDate: { type: Date, required: true },
  invoiceType: { type: String, enum: ["Damage", "Claim"], required: true },
  cashAccount: String,
  damageAccount: String,
  claimedAmount: Number,
  returnAmount: Number,
  remarks: String,
  customer: {
    id: Number,
    code: String,
    name: String,
    address: String,
    contact: String,
  },
  items: [claimItemSchema],
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Claim', claimSchema);