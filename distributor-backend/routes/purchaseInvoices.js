const express = require('express');
const router = express.Router();
const purchaseInvoicesController = require('../controllers/purchaseInvoicesController');

// Create new purchase invoice
router.post('/', purchaseInvoicesController.createPurchaseInvoice);

// Get purchase invoice by number
router.get('/number/:number', purchaseInvoicesController.getPurchaseInvoiceByNumber);

// Generate printable invoice
router.get('/print/:number', purchaseInvoicesController.generatePrintableInvoice);

// Generate invoice number
router.get('/generate-number', purchaseInvoicesController.generatePurchaseInvoiceNumber);

module.exports = router;