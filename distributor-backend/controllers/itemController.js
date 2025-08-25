const Item = require('../models/Item');

// Create Item with auto-generated code
exports.createItem = async (req, res) => {
  try {
    // Generate ITEM-XXX code
    const lastItem = await Item.findOne().sort({ code: -1 });
    let nextCode = "ITEM-001";
    
    if (lastItem && lastItem.code) {
      const lastNum = parseInt(lastItem.code.split('-')[1]);
      nextCode = `ITEM-${String(lastNum + 1).padStart(3, '0')}`;
    }

    // Create new item
    const newItem = await Item.create({ 
      ...req.body,
      code: nextCode
    });

    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ 
      error: err.message,
      message: 'Failed to create item'
    });
  }
};

// Get all items with sorting
exports.getItems = async (req, res) => {
  try {
    const items = await Item.find().sort({ code: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ 
      error: err.message,
      message: 'Failed to fetch items'
    });
  }
};

// Update item
exports.updateItem = async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ 
      error: err.message,
      message: 'Failed to update item'
    });
  }
};

// Delete item
exports.deleteItem = async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    
    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json({ 
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ 
      error: err.message,
      message: 'Failed to delete item'
    });
  }
};