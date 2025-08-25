const mongoose = require('mongoose');

const PurchaseItemSchema = new mongoose.Schema({
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
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
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
  stax: {
    type: Number,
    default: 17,
    min: 0,
    max: 100,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: false });

const PurchaseInvoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
  },
  invoiceDate: {
    type: Date,
    required: true,
  },
  bookingDate: {
    type: Date,
    required: true,
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
  },
  supplierCode: {
    type: String,
    required: true,
  },
  supplierName: {
    type: String,
    required: true,
  },
  supplierAddress: String,
  supplierContact: String,
  supplierRegion: String,
  items: [PurchaseItemSchema],
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
  currentBill: {
    type: Number,
    default: 0,
  },
  cashAccount: {
    type: String,
    enum: ['by hand', 'in account'],
    default: 'by hand',
  },
  region: {
    type: String,
    required: true,
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

// Indexes for performance
PurchaseInvoiceSchema.index({ invoiceNumber: 1 });
PurchaseInvoiceSchema.index({ supplierId: 1 });
PurchaseInvoiceSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PurchaseInvoice', PurchaseInvoiceSchema);