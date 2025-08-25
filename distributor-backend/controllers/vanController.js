// Update createVan to handle file uploads
exports.createVan = async (req, res) => {
  try {
    const { vanNumber, plateNumber } = req.body;
    let image = '';

    if (!vanNumber || !plateNumber) {
      return res.status(400).json({ message: "Van number and plate number are required." });
    }

    // Handle file upload if exists
    if (req.file) {
      image = req.file.path; // This assumes you're using multer for file uploads
    }

    // Check for duplicate van number
    const existingVan = await Van.findOne({ vanNumber });
    if (existingVan) {
      return res.status(400).json({ message: "Van number already exists" });
    }

    const newVan = await Van.create({ vanNumber, plateNumber, image });
    res.status(201).json(newVan);
  } catch (err) {
    res.status(500).json({ 
      message: err.message,
      details: "Server error occurred while creating van"
    });
  }
};