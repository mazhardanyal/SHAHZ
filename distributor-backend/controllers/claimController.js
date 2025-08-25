const Claim = require('../models/claimModel');

const createClaim = async (req, res) => {
  try {
    const { invoiceNo, invoiceDate, claimData, claimItems, selectedCustomer } = req.body;

    // Basic validation
    if (!invoiceNo || !invoiceDate || !claimData || !claimItems || !selectedCustomer) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newClaim = new Claim({
      invoiceNo,
      invoiceDate,
      ...claimData,
      customer: selectedCustomer,
      items: claimItems,
    });

    await newClaim.save();
    res.status(201).json({ 
      success: true,
      message: "Claim saved successfully", 
      claimId: newClaim._id 
    });
  } catch (error) {
    console.error("Error creating claim:", error);
    res.status(500).json({ 
      success: false,
      error: "Server error" 
    });
  }
};

module.exports = { createClaim };