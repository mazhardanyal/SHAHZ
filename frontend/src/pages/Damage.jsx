import { useState, useEffect, useRef } from "react";
import { useReactToPrint } from 'react-to-print';

export default function DamageClaim() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [claimItems, setClaimItems] = useState([]);
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [claimData, setClaimData] = useState({
    invoiceType: "Damage",
    cashAccount: "",
    damageAccount: "",
    claimedAmount: 0,
    returnAmount: 0,
    remarks: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generatedInvoiceNo, setGeneratedInvoiceNo] = useState("");
  const printRef = useRef();

  // Generate a unique invoice number
  const generateInvoiceNumber = () => {
    const prefix = claimData.invoiceType === "Damage" ? "DMG" : "CLM";
    const date = new Date();
    const timestamp = date.getTime().toString().slice(-4);
    return `${prefix}-${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${timestamp}`;
  };

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setInvoiceDate(today);
    setGeneratedInvoiceNo(generateInvoiceNumber());

    const fetchCustomers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/accounts/customers");
        const data = await response.json();
        setCustomers(data);
      } catch (err) {
        setError("Failed to load customers");
      }
    };

    fetchCustomers();
  }, [claimData.invoiceType]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onBeforeGetContent: async () => {
      if (!isSubmitted) {
        await handleSubmit(new Event('print'), true);
      }
    },
    onAfterPrint: () => {
      // Reset form after printing if needed
    }
  });

  const handleCustomerChange = async (e) => {
    const customerId = e.target.value;
    const selected = customers.find(c => c._id === customerId);
    setSelectedCustomer(selected || null);

    if (selected) {
      try {
        const response = await fetch(`http://localhost:5000/api/invoices/customer/${selected._id}`);
        const data = await response.json();
        setInvoices(data);
      } catch (err) {
        console.error("Failed to fetch invoices", err);
        setInvoices([]);
      }
    }
  };

  const calculateItemTotal = (item) => {
    const qty = parseFloat(item.qty) || 0;
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const sTax = parseFloat(item.sTax) || 0;
    const disc1 = parseFloat(item.disc1) || 0;
    const disc2 = parseFloat(item.disc2) || 0;

    let baseAmount = qty * unitPrice;
    if (disc1 > 0) baseAmount *= (1 - disc1 / 100);
    if (disc2 > 0) baseAmount *= (1 - disc2 / 100);
    const taxAmount = baseAmount * (sTax / 100);
    return (baseAmount + taxAmount).toFixed(2);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...claimItems];
    newItems[index] = { ...newItems[index], [field]: value };

    if (['qty', 'unitPrice', 'sTax', 'disc1', 'disc2'].includes(field)) {
      newItems[index].total = calculateItemTotal(newItems[index]);
    }

    setClaimItems(newItems);
  };

  const addNewItem = () => {
    setClaimItems([...claimItems, {
      qty: 0, itemCode: "", description: "", unit: "", batchNo: "", expDate: "",
      damage: 0, claim: 0, return: 0, unitPrice: 0, sTax: 17, disc1: 0, disc2: 0, total: 0
    }]);
  };

  const handleSubmit = async (e, isPrinting = false) => {
    if (e) e.preventDefault();

    if (!selectedCustomer) {
      alert("Please select a customer.");
      return false;
    }

    if (claimItems.length === 0) {
      alert("Please add at least one item.");
      return false;
    }

    try {
      setLoading(true);
      
      // Generate invoice number if not already set
      const finalInvoiceNo = isSubmitted ? generatedInvoiceNo : generateInvoiceNumber();
      if (!isSubmitted) {
        setGeneratedInvoiceNo(finalInvoiceNo);
      }

      const response = await fetch("http://localhost:5000/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceNo: finalInvoiceNo,
          invoiceDate,
          claimData,
          claimItems,
          selectedCustomer
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit claim");
      }

      if (!isPrinting) {
        alert("Claim submitted successfully! ID: " + data.claimId);
      }

      setIsSubmitted(true);
      return true;

    } catch (err) {
      alert(`Error: ${err.message}`);
      console.error("Submission error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const grandTotal = claimItems.reduce((sum, item) => sum + parseFloat(item.total || 0), 0).toFixed(2);

  return (
    <div className="bg-white min-h-screen px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">Damage/Claim Management</h1>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="font-medium">Invoice Type</label>
          <select
            value={claimData.invoiceType}
            onChange={(e) => setClaimData({ ...claimData, invoiceType: e.target.value })}
            className="w-full border rounded px-3 py-2"
          >
            <option value="Damage">Damage</option>
            <option value="Claim">Claim</option>
          </select>
        </div>

        <div>
          <label className="font-medium">Invoice No</label>
          <input
            type="text"
            readOnly
            value={generatedInvoiceNo}
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>

        <div>
          <label className="font-medium">Customer Code</label>
          <input
            type="text"
            readOnly
            value={selectedCustomer?.accountCode || ""}
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>

        <div>
          <label className="font-medium">Customer/Supplier Name *</label>
          <select
            value={selectedCustomer?._id || ""}
            onChange={handleCustomerChange}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Select customer</option>
            {customers.map(c => (
              <option key={c._id} value={c._id}>
                {c.description} ({c.accountCode})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-medium">Address</label>
          <input
            type="text"
            readOnly
            value={selectedCustomer?.address || ""}
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>

        <div>
          <label className="font-medium">Contact No</label>
          <input
            type="text"
            readOnly
            value={selectedCustomer?.contactNo || ""}
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>

        <div>
          <label className="font-medium">Reference Invoice No</label>
          <select
            value={invoiceNo}
            onChange={(e) => setInvoiceNo(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select Invoice</option>
            {invoices.map((inv) => (
              <option key={inv._id} value={inv.invoiceNo}>
                {inv.invoiceNo} - {new Date(inv.date).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-medium">Invoice Date *</label>
          <input
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="font-medium">Cash Account</label>
          <input
            type="text"
            value={claimData.cashAccount}
            onChange={(e) => setClaimData({ ...claimData, cashAccount: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="font-medium">Damage Account</label>
          <input
            type="text"
            value={claimData.damageAccount}
            onChange={(e) => setClaimData({ ...claimData, damageAccount: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="font-medium">Claimed Amount</label>
          <input
            type="number"
            value={claimData.claimedAmount}
            onChange={(e) => setClaimData({ ...claimData, claimedAmount: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="font-medium">Return Amount</label>
          <input
            type="number"
            value={claimData.returnAmount}
            onChange={(e) => setClaimData({ ...claimData, returnAmount: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="md:col-span-2">
          <label className="font-medium">Remarks</label>
          <textarea
            value={claimData.remarks}
            onChange={(e) => setClaimData({ ...claimData, remarks: e.target.value })}
            className="w-full border rounded px-3 py-2"
            rows="2"
          />
        </div>

        <div className="mt-6 flex gap-4 flex-wrap md:col-span-2">
          <button
            type="button"
            onClick={() => {
              setSelectedCustomer(null);
              setClaimItems([]);
              setInvoiceNo("");
              setInvoiceDate(new Date().toISOString().split('T')[0]);
              setClaimData({
                invoiceType: "Damage",
                cashAccount: "",
                damageAccount: "",
                claimedAmount: 0,
                returnAmount: 0,
                remarks: ""
              });
              setIsSubmitted(false);
              setGeneratedInvoiceNo(generateInvoiceNumber());
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            New Claim
          </button>

          <button
            type="button"
            onClick={addNewItem}
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
          >
            Add Item
          </button>

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Save Claim"}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Print Claim"}
          </button>
        </div>
      </form>

      <div className="mt-10 overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm text-gray-700">
          <thead className="bg-gray-100">
            <tr>
              {["Qty", "Item Code", "Description", "Unit", "Batch No", "Exp Date", "Damage", "Claim", "Return", "Unit Price", "S.Tax %", "Disc1 %", "Disc2 %", "Total", "Actions"].map((h, i) => (
                <th key={i} className="border px-2 py-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {claimItems.length > 0 ? (
              claimItems.map((item, index) => (
                <tr key={index}>
                  {["qty", "itemCode", "description", "unit", "batchNo", "expDate", "damage", "claim", "return", "unitPrice", "sTax", "disc1", "disc2"].map(field => (
                    <td key={field} className="border px-2 py-2">
                      <input
                        type={field === "expDate" ? "date" : "number"}
                        value={item[field]}
                        onChange={(e) => handleItemChange(index, field, e.target.value)}
                        className="w-full border-none bg-transparent"
                      />
                    </td>
                  ))}
                  <td className="border px-2 py-2">
                    PKR {parseFloat(item.total || 0).toLocaleString("en-PK", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="border px-2 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...claimItems];
                        updated.splice(index, 1);
                        setClaimItems(updated);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="15" className="border px-2 py-4 text-center text-gray-500">
                  No items added. Click "Add Item" to start.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {claimItems.length > 0 && (
          <div className="text-right mt-4 text-lg font-semibold">
            Grand Total: PKR {parseFloat(grandTotal).toLocaleString("en-PK", { minimumFractionDigits: 2 })}
          </div>
        )}
      </div>

      {/* Print template (hidden on screen) */}
      <div className="hidden">
        <div ref={printRef} className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">{claimData.invoiceType} Claim Invoice</h1>
            <p className="text-lg">Invoice No: {generatedInvoiceNo}</p>
            <p className="text-sm">Date: {new Date(invoiceDate).toLocaleDateString()}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-bold">Customer Information</h3>
              <p>{selectedCustomer?.description}</p>
              <p>{selectedCustomer?.address}</p>
              <p>Contact: {selectedCustomer?.contactNo}</p>
              <p>Customer Code: {selectedCustomer?.accountCode}</p>
            </div>
            <div className="text-right">
              <h3 className="font-bold">Claim Details</h3>
              <p>Type: {claimData.invoiceType}</p>
              {invoiceNo && <p>Reference Invoice: {invoiceNo}</p>}
              <p>Remarks: {claimData.remarks}</p>
            </div>
          </div>

          <table className="w-full border-collapse border border-gray-400">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 p-2">Item Code</th>
                <th className="border border-gray-400 p-2">Description</th>
                <th className="border border-gray-400 p-2">Qty</th>
                <th className="border border-gray-400 p-2">Unit Price</th>
                <th className="border border-gray-400 p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {claimItems.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-400 p-2">{item.itemCode}</td>
                  <td className="border border-gray-400 p-2">{item.description}</td>
                  <td className="border border-gray-400 p-2 text-right">{item.qty}</td>
                  <td className="border border-gray-400 p-2 text-right">{item.unitPrice}</td>
                  <td className="border border-gray-400 p-2 text-right">{item.total}</td>
                </tr>
              ))}
              <tr className="font-bold">
                <td colSpan="4" className="border border-gray-400 p-2 text-right">Grand Total:</td>
                <td className="border border-gray-400 p-2 text-right">{grandTotal}</td>
              </tr>
            </tbody>
          </table>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold mb-2">Customer Signature</h3>
              <div className="h-16 border-t-2 border-black"></div>
            </div>
            <div>
              <h3 className="font-bold mb-2">Company Stamp & Signature</h3>
              <div className="h-16 border-t-2 border-black"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}