const Account = require('../models/Account');

// 🔢 Auto-generate account code like SUP-001
const generateAccountCode = async (accountType) => {
  const prefix = accountType.slice(0, 3).toUpperCase(); // SUP, CUS, PUR
  const count = await Account.countDocuments({ accountType });
  const number = String(count + 1).padStart(3, '0');
  return `${prefix}-${number}`;
};

// ✅ Create a new account (supplier, customer, etc.)
exports.createAccount = async (req, res) => {
  try {
    const accountCode = await generateAccountCode(req.body.accountType);

    const newAccount = await Account.create({
      accountType: req.body.accountType,
      accountCode,
      description: req.body.description,
      address: req.body.address,
     contactNo: req.body.contactNumber,
     cellNo: req.body.cellNumber,
      region: req.body.region,
      customerType: req.body.customerType
    });

    res.status(201).json(newAccount);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 🧾 Get all accounts
exports.getAllAccounts = async (req, res) => {
  try {
    const accounts = await Account.find();
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟨 Get only suppliers
exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Account.find({ accountType: 'Supplier' });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟦 Get only customers
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Account.find({ accountType: 'Customer' });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};







// 👇 Add this helper
exports.getCustomerByCode = async (req, res) => {
  try {
    const customer = await Account.findOne({
      accountType: 'Customer',
      accountCode: req.params.code,
    });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    // remap fields
    const mapped = customer.toObject();
    mapped.contactNumber = mapped.contactNo;
    mapped.cellNumber = mapped.cellNo;
    delete mapped.contactNo;
    delete mapped.cellNo;

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};







// 🟥 Get only purchasers
exports.getPurchasers = async (req, res) => {
  try {
    const purchasers = await Account.find({ accountType: 'Purchaser' });
    res.json(purchasers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✏️ Update account by ID
exports.updateAccount = async (req, res) => {
  try {
    const updated = await Account.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: 'Account not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ❌ Delete account by ID
exports.deleteAccount = async (req, res) => {
  try {
    const deleted = await Account.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Account not found' });
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
