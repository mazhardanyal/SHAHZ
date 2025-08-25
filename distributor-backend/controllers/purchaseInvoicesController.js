const PurchaseInvoice = require('../models/PurchaseInvoice');
const Account = require('../models/Account');

// Create new purchase invoice
exports.createPurchaseInvoice = async (req, res) => {
  try {
    // Validate supplier exists
    const supplier = await Account.findById(req.body.supplierId);
    if (!supplier) {
      return res.status(400).json({
        success: false,
        error: 'Supplier not found'
      });
    }

    // Check if invoice number already exists
    const existingInvoice = await PurchaseInvoice.findOne({ 
      invoiceNumber: req.body.invoiceNumber 
    });
    if (existingInvoice) {
      return res.status(400).json({
        success: false,
        error: 'Invoice number already exists'
      });
    }

    // Calculate totals if not provided
    const items = req.body.items || [];
    const grossTotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    
    const netBalance = (
      parseFloat(req.body.currentBill || 0) + 
      grossTotal + 
      parseFloat(req.body.otherCharges || 0) - 
      parseFloat(req.body.discount || 0) + 
      parseFloat(req.body.previousBalance || 0) - 
      parseFloat(req.body.amountReceived || 0)
    );

    // Create new invoice
    const newInvoice = await PurchaseInvoice.create({
      ...req.body,
      supplierCode: supplier.accountCode,
      supplierName: supplier.description,
      supplierAddress: supplier.address,
      supplierContact: supplier.contactNo || supplier.cellNumber,
      supplierRegion: supplier.region,
      grossTotal,
      netBalance
    });

    res.status(201).json({
      success: true,
      data: newInvoice
    });
  } catch (err) {
    console.error('Error creating purchase invoice:', err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Get purchase invoice by number
exports.getPurchaseInvoiceByNumber = async (req, res) => {
  try {
    const invoice = await PurchaseInvoice.findOne({ 
      invoiceNumber: req.params.number 
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Purchase invoice not found'
      });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (err) {
    console.error('Error fetching purchase invoice:', err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Generate printable invoice HTML
exports.generatePrintableInvoice = async (req, res) => {
  try {
    const invoice = await PurchaseInvoice.findOne({ 
      invoiceNumber: req.params.number 
    }).lean();

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    const formatCurrency = (amount) => {
      return `PKR ${Number.parseFloat(amount || 0).toLocaleString('en-PK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    };

    const printHTML = `<!DOCTYPE html>
    <html>
    <head>
      <title>Purchase Invoice ${invoice.invoiceNumber}</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; line-height: 1.4; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .header h1 { font-size: 24px; margin-bottom: 10px; color: #333; }
        .header h2 { font-size: 18px; margin-bottom: 5px; color: #666; }
        .supplier-info { margin-bottom: 20px; background-color: #f9f9f9; padding: 15px; border-radius: 5px; }
        .supplier-info h3 { margin-bottom: 10px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        .invoice-details { margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; }
        .invoice-details p { background-color: #f5f5f5; padding: 8px; border-radius: 3px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
        .number-cell { text-align: right; }
        .totals { margin-top: 20px; background-color: #f9f9f9; padding: 15px; border-radius: 5px; }
        .totals p { margin-bottom: 5px; display: flex; justify-content: space-between; }
        .totals .final-total { font-size: 16px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; margin-top: 10px; }
        @media print {
          body { margin: 0; font-size: 11px; }
          .no-print { display: none !important; }
          .header { margin-bottom: 20px; }
          table { font-size: 9px; }
        }
        .no-print { margin-top: 30px; text-align: center; }
        .no-print button { margin: 0 10px; padding: 10px 20px; font-size: 14px; border: none; border-radius: 5px; cursor: pointer; }
        .print-btn { background-color: #007bff; color: white; }
        .close-btn { background-color: #6c757d; color: white; }
        .print-btn:hover { background-color: #0056b3; }
        .close-btn:hover { background-color: #545b62; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>PURCHASE INVOICE</h1>
        <h2>Invoice #: ${invoice.invoiceNumber}</h2>
        <p><strong>Date: ${new Date(invoice.invoiceDate).toLocaleDateString('en-PK')}</strong></p>
      </div>
      <div class="supplier-info">
        <h3>Supplier Information</h3>
        <p><strong>Code:</strong> ${invoice.supplierCode || "N/A"}</p>
        <p><strong>Name:</strong> ${invoice.supplierName || "N/A"}</p>
        <p><strong>Address:</strong> ${invoice.supplierAddress || "N/A"}</p>
        <p><strong>Contact:</strong> ${invoice.supplierContact || "N/A"}</p>
        <p><strong>Region:</strong> ${invoice.supplierRegion || "N/A"}</p>
      </div>
      <div class="invoice-details">
        <p><strong>Booking By:</strong> ${invoice.bookingBy || "N/A"}</p>
        <p><strong>Cash Account:</strong> ${invoice.cashAccount || "N/A"}</p>
        <p><strong>Remarks:</strong> ${invoice.remarks || "N/A"}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 8%;">Item Code</th>
            <th style="width: 15%;">Description</th>
            <th style="width: 6%;">Unit</th>
            <th style="width: 8%;">Batch No</th>
            <th style="width: 6%;">Qty</th>
            <th style="width: 8%;">Unit Price</th>
            <th style="width: 6%;">Disc1 %</th>
            <th style="width: 6%;">Disc2 %</th>
            <th style="width: 6%;">Tax %</th>
            <th style="width: 10%;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map(item => `
          <tr>
              <td>${item.itemCode || ""}</td>
              <td>${item.description || ""}</td>
              <td>${item.unit || ""}</td>
              <td>${item.batchNo || ""}</td>
              <td class="number-cell">${Number.parseFloat(item.qty || 0).toLocaleString()}</td>
              <td class="number-cell">${formatCurrency(item.unitPrice)}</td>
              <td class="number-cell">${Number.parseFloat(item.disc1 || 0)}%</td>
              <td class="number-cell">${Number.parseFloat(item.disc2 || 0)}%</td>
              <td class="number-cell">${Number.parseFloat(item.stax || 0)}%</td>
              <td class="number-cell"><strong>${formatCurrency(item.total)}</strong></td>
          </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="totals">
        <p><span>Current Bill:</span> <span>${formatCurrency(invoice.currentBill)}</span></p>
        <p><span>Gross Total:</span> <span><strong>${formatCurrency(invoice.grossTotal)}</strong></span></p>
        <p><span>Other Charges:</span> <span>${formatCurrency(invoice.otherCharges)}</span></p>
        <p><span>Previous Balance:</span> <span>${formatCurrency(invoice.previousBalance)}</span></p>
        <p><span>Discount:</span> <span>${formatCurrency(invoice.discount)}</span></p>
        <p><span>Amount Received:</span> <span>${formatCurrency(invoice.amountReceived)}</span></p>
        <p class="final-total"><span>Net Balance:</span> <span>${formatCurrency(invoice.netBalance)}</span></p>
      </div>
      <div class="no-print">
        <button class="print-btn" onclick="window.print()">🖨️ Print Invoice</button>
        <button class="close-btn" onclick="window.close()">❌ Close Window</button>
      </div>
      <script>
        window.onload = function() {
          window.focus();
          setTimeout(() => {
            window.print();
          }, 500);
        };
        window.onafterprint = function() {
          setTimeout(() => {
            window.close();
          }, 500);
        };
      </script>
    </body>
    </html>`;

    res.send(printHTML);
  } catch (err) {
    console.error('Error generating printable invoice:', err);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Generate purchase invoice number
exports.generatePurchaseInvoiceNumber = async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    // Count today's invoices
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));
    
    const count = await PurchaseInvoice.countDocuments({
      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    const number = `PINV-${year}${month}${day}-${String(count + 1).padStart(3, '0')}`;
    
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