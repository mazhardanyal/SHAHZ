const express = require('express');
const router = express.Router();
const invoicesController = require('../controllers/invoiceController');


// Create new invoice
router.post('/', invoicesController.createInvoice);

// Get invoice by number
router.get('/number/:number', invoicesController.getInvoiceByNumber);

// Get all invoices
router.get('/', invoicesController.getAllInvoices);

// Update invoice
router.put('/:id', invoicesController.updateInvoice);

// Delete invoice
router.delete('/:id', invoicesController.deleteInvoice);

// Generate invoice number
router.get('/generate-number', invoicesController.generateInvoiceNumber);

module.exports = router;