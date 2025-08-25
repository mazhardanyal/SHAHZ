const mongoose = require('mongoose');

const InvoiceItemSchema = new mongoose.Schema({
  itemCode: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  batchNo: String,
  qty: {
    type: Number,
    required: true,
    min: 0,
  },
  bonus: {
    type: Number,
    default: 0,
    min: 0,
  },
  return: {
    type: Number,
    default: 0,
    min: 0,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  sTax: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  disc1: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  disc2: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: false });

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
  },
  invoiceDate: {
    type: Date,
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
  },
  customerCode: {
    type: String,
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  customerAddress: String,
  customerContact: String,
  customerRegion: String,
  items: [InvoiceItemSchema],
  van: String,
  bookingBy: String,
  remarks: String,
  otherCharges: {
    type: Number,
    default: 0,
    min: 0,
  },
  amountReceived: {
    type: Number,
    default: 0,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  previousBalance: {
    type: Number,
    default: 0,
  },
  grossTotal: {
    type: Number,
    required: true,
    min: 0,
  },
  netBalance: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Add index for faster searches
InvoiceSchema.index({ invoiceNumber: 1 });
InvoiceSchema.index({ customerId: 1 });
InvoiceSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Invoice', InvoiceSchema);