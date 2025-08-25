const express = require("express");
const router = express.Router();
const Account = require("../models/Account");
const {
  createAccount,
  getAllAccounts,
  getSuppliers,
  getCustomers,
  getPurchasers,
  updateAccount,
  deleteAccount,
   getCustomerByCode 
  
} = require("../controllers/accountController");

// Create a new account
router.post("/", createAccount);

// Get all accounts
router.get("/", getAllAccounts);

// Get specific account types
router.get("/suppliers", getSuppliers);
router.get("/customers", getCustomers);
router.get("/purchasers", getPurchasers);
router.get("/customers/customer-by-code/:code", getCustomerByCode);

// Update an account
router.put("/:id", updateAccount);

// Delete an account
router.delete("/:id", deleteAccount);

module.exports = router;