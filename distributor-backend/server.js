const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load env
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error", err));

// Routes
const itemRoutes = require("./routes/itemRoutes");
const companyRoutes = require('./routes/companyRoutes');
// const authRoutes = require('./routes/authRoutes'); 
const accountsRouter = require('./routes/accountRoutes');
const invoicesRouter = require('./routes/invoices');
const purchaseInvoicesRouter = require('./routes/purchaseInvoices');
const regionRoutes = require('./routes/regionRoutes');
const claimRoutes = require('./routes/claimRoutes');


app.use("/api/regions", regionRoutes);
app.use("/api/items", itemRoutes);
app.use('/api/companies', companyRoutes);
// app.use("/api/vans", vanRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/accounts', accountsRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/purchase-invoices', purchaseInvoicesRouter);
app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request for ${req.url}`);
  next();
});

app.listen(5000, () => console.log("🚀 Server running at http://localhost:5000"));