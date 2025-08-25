import { useState, useEffect, useCallback } from "react";
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  PrinterIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const Spinner = () => (
  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const API_BASE_URL = "http://localhost:5000/api";

export default function PurchaseInvoice() {
  // State for suppliers and items data
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [searchReport, setSearchReport] = useState("");
  const [searchInvoice, setSearchInvoice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Invoice data
  const [invoiceData, setInvoiceData] = useState({
    bookingBy: "",
    remarks: "",
    otherCharges: 0,
    amountReceived: 0,
    discount: 0,
    previousBalance: 0,
    currentBill: 0,
    cashAccount: "by hand",
    region: "North"
  });

  // Generate invoice number and date
  const currentDate = new Date().toISOString().split('T')[0];
  const [invoiceNumber, setInvoiceNumber] = useState("");

  // Fetch suppliers, items and generate invoice number on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch suppliers
        const suppliersResponse = await fetch(`${API_BASE_URL}/accounts/suppliers`);
        if (!suppliersResponse.ok) throw new Error('Failed to fetch suppliers');
        const suppliersData = await suppliersResponse.json();
        setSuppliers(suppliersData);

        // Fetch items
        const itemsResponse = await fetch(`${API_BASE_URL}/items`);
        if (!itemsResponse.ok) throw new Error('Failed to fetch items');
        const itemsData = await itemsResponse.json();
        setItems(itemsData);

        // Generate invoice number
        const invoiceNumberResponse = await fetch(`${API_BASE_URL}/purchase-invoices/generate-number`);
        if (!invoiceNumberResponse.ok) throw new Error('Failed to generate invoice number');
        const { data: invoiceNum } = await invoiceNumberResponse.json();
        setInvoiceNumber(invoiceNum);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Calculate item total
  const calculateItemTotal = useCallback((item) => {
    const qty = parseFloat(item.qty) || 0;
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const disc1 = parseFloat(item.disc1) || 0;
    const disc2 = parseFloat(item.disc2) || 0;
    const stax = parseFloat(item.stax) || 0;
    
    let total = qty * unitPrice;
    if (disc1 > 0) total = total * (1 - disc1/100);
    if (disc2 > 0) total = total * (1 - disc2/100);
    if (stax > 0) total = total * (1 + stax/100);
    
    return total.toFixed(2);
  }, []);

  // Handle item selection
  const handleItemSelect = useCallback((index, itemId) => {
    const selectedItem = items.find(item => item._id === itemId);
    if (!selectedItem) return;

    setInvoiceItems(prevItems => {
      const newItems = [...prevItems];
      newItems[index] = { 
        ...newItems[index],
        itemCode: selectedItem.code,
        description: selectedItem.description,
        unit: selectedItem.unit,
        unitPrice: selectedItem.unitPrice,
        // Calculate total after setting the price
        total: calculateItemTotal({
          ...newItems[index],
          unitPrice: selectedItem.unitPrice
        })
      };
      return newItems;
    });
  }, [items, calculateItemTotal]);

  // Handle other item changes
  const handleItemChange = useCallback((index, field, value) => {
    setInvoiceItems(prevItems => {
      const newItems = [...prevItems];
      newItems[index] = { ...newItems[index], [field]: value };
      
      if (['qty', 'unitPrice', 'disc1', 'disc2', 'stax'].includes(field)) {
        newItems[index].total = calculateItemTotal(newItems[index]);
      }
      
      return newItems;
    });
  }, [calculateItemTotal]);

  // Add new item row
  const addNewItem = useCallback(() => {
    setInvoiceItems(prev => [
      ...prev,
      { 
        itemCode: "", 
        description: "", 
        unit: "", 
        batchNo: "", 
        qty: 1, 
        bonus: 0, 
        return: 0, 
        unitPrice: 0,
        disc1: 0,
        disc2: 0,
        stax: 17,
        total: 0 
      }
    ]);
  }, []);
  // Calculate net balance
  const calculateNetBalance = useCallback(() => {
    const subtotal = invoiceItems.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
    const { otherCharges, discount, previousBalance, amountReceived, currentBill } = invoiceData;
    
    return (
      parseFloat(currentBill) + 
      subtotal + 
      parseFloat(otherCharges) - 
      parseFloat(discount) + 
      parseFloat(previousBalance) - 
      parseFloat(amountReceived)
    ).toFixed(2);
  }, [invoiceItems, invoiceData]);

  // Save invoice to backend with better error handling
  const saveInvoiceToDatabase = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!selectedSupplier) {
        throw new Error("Please select a supplier");
      }
      
      if (invoiceItems.length === 0) {
        throw new Error("Please add at least one item");
      }

      // Validate all required item fields
      const invalidItems = invoiceItems.filter(
        item => !item.itemCode?.trim() || 
               !item.description?.trim() || 
               !item.unit?.trim() ||
               parseFloat(item.qty) <= 0 ||
               parseFloat(item.unitPrice) <= 0
      );

      if (invalidItems.length > 0) {
        throw new Error("Please fill all required fields for items (Code, Description, Unit, Qty > 0, Price > 0)");
      }

      const grossTotal = invoiceItems.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
      const netBalance = calculateNetBalance();

      const invoicePayload = {
        supplierId: selectedSupplier._id,
        invoiceNumber,
        invoiceDate: currentDate,
        bookingDate: currentDate,
        ...invoiceData,
        items: invoiceItems.map(item => ({
          ...item,
          qty: parseFloat(item.qty) || 0,
          unitPrice: parseFloat(item.unitPrice) || 0,
          disc1: parseFloat(item.disc1) || 0,
          disc2: parseFloat(item.disc2) || 0,
          stax: parseFloat(item.stax) || 0,
          total: parseFloat(item.total) || 0
        })),
        grossTotal: parseFloat(grossTotal),
        netBalance: parseFloat(netBalance),
        region: selectedSupplier.region || invoiceData.region
      };

      const response = await fetch(`${API_BASE_URL}/purchase-invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoicePayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        // Try to parse as JSON, if not return raw text
        const errorData = errorText.startsWith('{') ? JSON.parse(errorText) : { error: errorText };
        throw new Error(errorData.error || 'Failed to save invoice');
      }

      const result = await response.json();
      return result.data;

    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [selectedSupplier, invoiceItems, invoiceData, invoiceNumber, currentDate, calculateNetBalance]);

  // Print invoice handler with better error handling
  const handlePrint = useCallback(async () => {
    try {
      // First save the invoice
      const savedInvoice = await saveInvoiceToDatabase();
      if (!savedInvoice) return;

      // Open print window
      const printWindow = window.open(
        `${API_BASE_URL}/purchase-invoices/print/${savedInvoice.invoiceNumber}`,
        '_blank',
        'width=900,height=700'
      );

      if (!printWindow) {
        throw new Error('Popup blocked! Please allow popups for this site.');
      }
      
      setSuccess('Invoice saved and print dialog opened!');
    } catch (err) {
      setError(err.message || 'Failed to print invoice');
    }
  }, [saveInvoiceToDatabase]);

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await saveInvoiceToDatabase();
      if (result) {
        setSuccess('Purchase invoice saved successfully!');
      }
    } catch (err) {
      // Errors are already handled by saveInvoiceToDatabase
    }
  };

  // Load invoice by number with better error handling
  const handleLoadInvoice = async () => {
    if (!searchInvoice.trim()) {
      setError("Please enter an invoice number");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/purchase-invoices/number/${searchInvoice.trim()}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        const errorData = errorText.startsWith('{') ? JSON.parse(errorText) : { error: errorText };
        
        if (response.status === 404) {
          throw new Error(errorData.error || 'Invoice not found');
        }
        throw new Error(errorData.error || 'Failed to load invoice');
      }

      const { data: invoice } = await response.json();
      
      // Find and set the supplier
      const supplier = suppliers.find(s => s._id === invoice.supplierId);
      if (!supplier) {
        throw new Error('Supplier not found in local data');
      }
      setSelectedSupplier(supplier);
      
      // Set invoice items
      setInvoiceItems(invoice.items || []);
      
      // Set invoice data
      setInvoiceData({
        bookingBy: invoice.bookingBy || "",
        remarks: invoice.remarks || "",
        otherCharges: invoice.otherCharges || 0,
        amountReceived: invoice.amountReceived || 0,
        discount: invoice.discount || 0,
        previousBalance: invoice.previousBalance || 0,
        currentBill: invoice.currentBill || 0,
        cashAccount: invoice.cashAccount || "by hand",
        region: invoice.region || "North"
      });
      
      setSuccess('Invoice loaded successfully!');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = useCallback(() => {
    setSelectedSupplier(null);
    setInvoiceItems([]);
    setInvoiceData({
      bookingBy: "",
      remarks: "",
      otherCharges: 0,
      amountReceived: 0,
      discount: 0,
      previousBalance: 0,
      currentBill: 0,
      cashAccount: "by hand",
      region: "North"
    });
    setError(null);
    setSuccess(null);
  }, []);

  return (
    <div className="p-4 max-w-screen-2xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Purchase Invoice</h1>
        
        {/* Search boxes */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchInvoice}
              onChange={(e) => setSearchInvoice(e.target.value)}
              placeholder="Search invoice..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleLoadInvoice}
              disabled={loading}
              className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="relative flex-1">
            <input
              type="text"
              value={searchReport}
              onChange={(e) => setSearchReport(e.target.value)}
              placeholder="Search report..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <MagnifyingGlassIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Status messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
            ✕
          </button>
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex justify-between items-center">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="text-green-700 hover:text-green-900">
            ✕
          </button>
        </div>
      )}

      {/* Main form container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Form header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Purchase Invoice Details</h2>
        </div>

        {/* Form content */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6">
          {/* Supplier information grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Supplier Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Code</label>
              <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-700">
                {selectedSupplier?.accountCode || "N/A"}
              </div>
            </div>
            
            {/* Supplier Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name *</label>
              <select 
                value={selectedSupplier?._id || ""}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selected = suppliers.find(s => s._id === selectedId);
                  setSelectedSupplier(selected);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              >
                <option value="">Select supplier</option>
                {suppliers.map(s => (
                  <option key={s._id} value={s._id}>{s.description}</option>
                ))}
              </select>
            </div>
            
            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-700">
                {selectedSupplier?.address || "N/A"}
              </div>
            </div>
            
            {/* Contact No */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact No</label>
              <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-700">
                {selectedSupplier?.contactNo || selectedSupplier?.cellNumber || "N/A"}
              </div>
            </div>
            
            {/* Booking By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Booking By</label>
              <input 
                value={invoiceData.bookingBy}
                onChange={(e) => setInvoiceData({...invoiceData, bookingBy: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            
            {/* Booking Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Booking Date</label>
              <input 
                type="date"
                value={currentDate}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
              />
            </div>
            
            {/* Invoice No */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice No</label>
              <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-700 font-medium">
                {invoiceNumber}
              </div>
            </div>
            
            {/* Invoice Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
              <input 
                type="date"
                value={currentDate}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
              />
            </div>
            
            {/* Region */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-700">
                {selectedSupplier?.region || invoiceData.region}
              </div>
            </div>
            
            {/* Cash Account */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cash Account</label>
              <select 
                value={invoiceData.cashAccount}
                onChange={(e) => setInvoiceData({...invoiceData, cashAccount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="by hand">By Hand</option>
                <option value="in account">In Account</option>
              </select>
            </div>
            
            {/* Current Bill */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Bill</label>
              <input 
                type="number"
                value={invoiceData.currentBill}
                onChange={(e) => setInvoiceData({...invoiceData, currentBill: e.target.value})}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            
            {/* Other Charges */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Other Charges</label>
              <input 
                type="number"
                value={invoiceData.otherCharges}
                onChange={(e) => setInvoiceData({...invoiceData, otherCharges: e.target.value})}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            
            {/* Amount Received */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount Received</label>
              <input 
                type="number"
                value={invoiceData.amountReceived}
                onChange={(e) => setInvoiceData({...invoiceData, amountReceived: e.target.value})}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            
            {/* Previous Balance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Previous Balance</label>
              <input 
                type="number"
                value={invoiceData.previousBalance}
                onChange={(e) => setInvoiceData({...invoiceData, previousBalance: e.target.value})}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            
            {/* Discount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
              <input 
                type="number"
                value={invoiceData.discount}
                onChange={(e) => setInvoiceData({...invoiceData, discount: e.target.value})}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            
            {/* Net Balance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Net Balance</label>
              <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 text-gray-700 font-semibold">
                {calculateNetBalance()}
              </div>
            </div>
          </div>

          {/* Items table section */}
          {/* Items table section */}
<div className="mt-6">
  <div className="flex justify-between items-center mb-3">
    <h2 className="text-md font-semibold text-gray-800">Invoice Items</h2>
    <button 
      type="button"
      onClick={addNewItem}
      disabled={loading}
      className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center gap-1 disabled:opacity-50"
    >
      <PlusIcon className="h-4 w-4" />
      Add Item
    </button>
  </div>

  {/* Compact table container with horizontal scroll */}
  <div className="border border-gray-200 rounded-lg overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200 text-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-2 py-2 text-left font-medium text-gray-700 whitespace-nowrap w-[90px]">Code</th>
          <th className="px-2 py-2 text-left font-medium text-gray-700 whitespace-nowrap w-[180px]">Description</th>
          <th className="px-2 py-2 text-left font-medium text-gray-700 whitespace-nowrap w-[50px]">Unit</th>
          <th className="px-2 py-2 text-left font-medium text-gray-700 whitespace-nowrap w-[70px]">Batch</th>
          <th className="px-2 py-2 text-left font-medium text-gray-700 whitespace-nowrap w-[60px]">Qty</th>
          <th className="px-2 py-2 text-left font-medium text-gray-700 whitespace-nowrap w-[80px]">Price</th>
          <th className="px-2 py-2 text-left font-medium text-gray-700 whitespace-nowrap w-[45px]">D1%</th>
          <th className="px-2 py-2 text-left font-medium text-gray-700 whitespace-nowrap w-[45px]">D2%</th>
          <th className="px-2 py-2 text-left font-medium text-gray-700 whitespace-nowrap w-[50px]">Tax%</th>
          <th className="px-2 py-2 text-left font-medium text-gray-700 whitespace-nowrap w-[80px]">Total</th>
          <th className="px-2 py-2 text-right font-medium text-gray-700 whitespace-nowrap w-[40px]"></th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {invoiceItems.length > 0 ? (
          invoiceItems.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              {/* Item Code */}
               <td className="px-2 py-1.5 whitespace-nowrap">
    <select
      value={items.find(i => i.code === item.itemCode)?._id || ""}
      onChange={(e) => handleItemSelect(index, e.target.value)}
      className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
      disabled={loading}
    >
      <option value="">Item Code</option>
      {items.map(item => (
        <option key={item._id} value={item._id}>
          {item.code} - {item.description}
        </option>
      ))}
    </select>
  </td>
              
              {/* Description - slightly smaller but still readable */}
              <td className="px-2 py-1.5">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  disabled={loading}
                />
              </td>
              
              {/* Unit - compact */}
              <td className="px-2 py-1.5 whitespace-nowrap">
                <input
                  type="text"
                  value={item.unit}
                  onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                  className="w-full px-1 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                  disabled={loading}
                />
              </td>
              
              {/* Batch No - compact */}
              <td className="px-2 py-1.5 whitespace-nowrap">
                <input
                  type="text"
                  value={item.batchNo}
                  onChange={(e) => handleItemChange(index, 'batchNo', e.target.value)}
                  className="w-full px-1 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  disabled={loading}
                />
              </td>
              
              {/* Quantity - compact */}
         <td className="px-2 py-1.5 whitespace-nowrap">
  <input
    type="number"
    value={item.qty}
    onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
    min="0"
    step="1"
    className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
    disabled={loading}
  />
</td>
              
              {/* Unit Price - right aligned */}
              <td className="px-2 py-1.5 whitespace-nowrap">
                <input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full px-1 py-1 border border-gray-300 rounded text-xs text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                  disabled={loading}
                />
              </td>
              
              {/* Discount 1% - very compact */}
              <td className="px-2 py-1.5 whitespace-nowrap">
                <input
                  type="number"
                  value={item.disc1}
                  onChange={(e) => handleItemChange(index, 'disc1', e.target.value)}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-0.5 py-1 border border-gray-300 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                  disabled={loading}
                />
              </td>
              
              {/* Discount 2% - very compact */}
              <td className="px-2 py-1.5 whitespace-nowrap">
                <input
                  type="number"
                  value={item.disc2}
                  onChange={(e) => handleItemChange(index, 'disc2', e.target.value)}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-0.5 py-1 border border-gray-300 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                  disabled={loading}
                />
              </td>
              
              {/* Tax% - compact */}
              <td className="px-2 py-1.5 whitespace-nowrap">
                <input
                  type="number"
                  value={item.stax}
                  onChange={(e) => handleItemChange(index, 'stax', e.target.value)}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-1 py-1 border border-gray-300 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                  disabled={loading}
                />
              </td>
              
              {/* Total - right aligned */}
              <td className="px-2 py-1.5 whitespace-nowrap font-medium text-gray-900 text-right text-xs">
                <div className="px-1.5 py-0.5 bg-gray-50 rounded inline-block">
                  {item.total}
                </div>
              </td>
              
              {/* Actions */}
              <td className="px-2 py-1.5 whitespace-nowrap text-right">
                <button
                  onClick={() => {
                    const newItems = [...invoiceItems];
                    newItems.splice(index, 1);
                    setInvoiceItems(newItems);
                  }}
                  className="text-red-600 hover:text-red-800 p-0.5 rounded hover:bg-red-50 disabled:opacity-50"
                  title="Remove item"
                  disabled={loading}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="11" className="px-4 py-3 text-center text-gray-500 text-xs">
              No items added. Click "Add Item" to start.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>

          {/* Remarks section */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
            <textarea
              value={invoiceData.remarks}
              onChange={(e) => setInvoiceData({...invoiceData, remarks: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Form actions */}
          <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={resetForm}
              disabled={loading}
              className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 justify-center disabled:opacity-50"
            >
              🆕 New Invoice
            </button>
            <button
              type="button"
              onClick={handlePrint}
              disabled={loading || !selectedSupplier || invoiceItems.length === 0}
              className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 justify-center disabled:opacity-50"
            >
              <PrinterIcon className="h-5 w-5" />
              Print Invoice
            </button>
            <button
              type="submit"
              disabled={loading || !selectedSupplier || invoiceItems.length === 0}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 justify-center disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Spinner />
                  Saving...
                </>
              ) : (
                <>
                  <CheckIcon className="h-5 w-5" />
                  Save Invoice
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}