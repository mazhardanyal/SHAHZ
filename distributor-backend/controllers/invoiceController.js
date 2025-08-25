const Invoice = require('../models/Invoice');
const Account = require('../models/Account');

// Create new invoice
exports.createInvoice = async (req, res) => {
  try {
    // Validate customer exists
    const customer = await Account.findById(req.body.customerId);
    if (!customer) {
      return res.status(400).json({
        success: false,
        error: 'Customer not found'
      });
    }

    // Check if invoice number already exists
    const existingInvoice = await Invoice.findOne({ 
      invoiceNumber: req.body.invoiceNumber 
    });
    if (existingInvoice) {
      return res.status(400).json({
        success: false,
        error: 'Invoice number already exists'
      });
    }

    // Create new invoice
    const newInvoice = await Invoice.create(req.body);

    res.status(201).json({
      success: true,
      data: newInvoice
    });
  } catch (err) {
    console.error('Error creating invoice:', err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Get invoice by number
exports.getInvoiceByNumber = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ 
      invoiceNumber: req.params.number 
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (err) {
    console.error('Error fetching invoice:', err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Get all invoices (with optional filters)
exports.getAllInvoices = async (req, res) => {
  try {
    const { customerId, startDate, endDate } = req.query;
    let query = {};

    if (customerId) {
      query.customerId = customerId;
    }

    if (startDate && endDate) {
      query.invoiceDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const invoices = await Invoice.find(query)
      .sort({ invoiceDate: -1 })
      .lean();

    res.json({
      success: true,
      data: invoices
    });
  } catch (err) {
    console.error('Error fetching invoices:', err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Update invoice
exports.updateInvoice = async (req, res) => {
  try {
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedInvoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      data: updatedInvoice
    });
  } catch (err) {
    console.error('Error updating invoice:', err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Delete invoice
exports.deleteInvoice = async (req, res) => {
  try {
    const deletedInvoice = await Invoice.findByIdAndDelete(req.params.id);

    if (!deletedInvoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error('Error deleting invoice:', err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Generate invoice number (optional)
exports.generateInvoiceNumber = async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    // Count today's invoices
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));
    
    const count = await Invoice.countDocuments({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    const number = `INV-${year}${month}${day}-${String(count + 1).padStart(3, '0')}`;
    
    res.json({
      success: true,
      data: number
    });
  } catch (err) {
    console.error('Error generating invoice number:', err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};