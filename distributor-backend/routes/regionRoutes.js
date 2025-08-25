const express = require("express");
const router = express.Router();
const Region = require("../models/Region");

// Get all regions
router.get("/", async (req, res) => {
  const regions = await Region.find();
  res.json(regions);
});

// Add new region
router.post("/", async (req, res) => {
  const { name, code } = req.body;
  const newRegion = new Region({ name, code });
  await newRegion.save();
  res.status(201).json(newRegion);
});

// Update region
router.put("/:id", async (req, res) => {
  const { name, code } = req.body;
  const updated = await Region.findByIdAndUpdate(
    req.params.id,
    { name, code },
    { new: true }
  );
  res.json(updated);
});

// Delete region
router.delete("/:id", async (req, res) => {
  await Region.findByIdAndDelete(req.params.id);
  res.json({ message: "Region deleted" });
});

module.exports = router;
