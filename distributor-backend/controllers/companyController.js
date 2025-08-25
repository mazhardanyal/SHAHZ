const Company = require('../models/Company');

// Auto-generate companyId like COMP-001
const generateCompanyId = async () => {
  const count = await Company.countDocuments();
  const number = String(count + 1).padStart(3, '0');
  return `COMP-${number}`;
};

exports.createCompany = async (req, res) => {
  try {
    const companyId = await generateCompanyId();

    const newCompany = await Company.create({
      companyId,
      name: req.body.name,
      address: req.body.address,
      contactNo: req.body.contactNo,
      email: req.body.email,
      isActive: req.body.isActive ?? true,
    });

    res.status(201).json(newCompany);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create company", error: err.message });
  }
};

exports.getCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
