"use client"
import { useState, useEffect, useMemo, useCallback } from "react"

export default function SalesInvoice() {
  /* ---------- STATE ---------- */
  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [searchReport, setSearchReport] = useState("")
  const [searchInvoice, setSearchInvoice] = useState("")
  const [invoiceItems, setInvoiceItems] = useState([])
  const [invoiceData, setInvoiceData] = useState({
    van: "",
    bookingBy: "",
    remarks: "",
    otherCharges: 0,
    amountReceived: 0,
    discount: 0,
    previousBalance: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /* ---------- DERIVED VALUES ---------- */
  const currentDate = new Date().toISOString().split("T")[0]
  const invoiceNumber = useMemo(() => {
    const now = new Date()
    return `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 1000) + 1).padStart(3, "0")}`
  }, [])

  /* ---------- CUSTOMER FETCH ---------- */
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch("http://localhost:5000/api/accounts/customers", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        })
        if (!res.ok) {
          const errorText = await res.text()
          throw new Error(`Failed to fetch customers: ${res.status} ${res.statusText} - ${errorText}`)
        }
        const data = await res.json()
        if (!Array.isArray(data)) {
          throw new Error("Invalid data format - expected array")
        }
        setCustomers(data.filter((customer) => customer.accountType === "Customer"))
      } catch (err) {
        console.error("Fetch customers error:", err)
        setError(`Failed to load customers: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }
    fetchCustomers()
  }, [])

  /* ---------- CUSTOMER SELECTION ---------- */
  const handleCustomerCodeChange = useCallback(async (e) => {
    const code = e.target.value
    console.log("Selected customer code:", code)

    if (!code) {
      setSelectedCustomer(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`http://localhost:5000/api/accounts/customers/customer-by-code/${code}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`Customer with code ${code} not found`)
        }
        const errorText = await res.text()
        throw new Error(errorText || `Failed to fetch customer: ${res.status}`)
      }

      const response = await res.json()
      console.log("Customer API response:", response)

      // Handle both direct response and wrapped response
      const customerData = response.data || response

      if (!customerData?._id) {
        console.error("Invalid customer data:", customerData)
        throw new Error("Invalid customer data received from server")
      }

      const selectedCustomerData = {
        id: customerData._id,
        code: customerData.accountCode,
        name: customerData.description,
        address: customerData.address || "",
        contact: customerData.cellNumber || customerData.contactNumber || "",
        region: customerData.region || "",
      }

      console.log("Setting selected customer:", selectedCustomerData)
      setSelectedCustomer(selectedCustomerData)
    } catch (err) {
      console.error("Customer selection error:", err)
      setSelectedCustomer(null)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  /* ---------- ITEM HELPERS ---------- */
  const calculateItemTotal = useCallback((item) => {
    const qty = Number.parseFloat(item.qty) || 0
    const price = Number.parseFloat(item.unitPrice) || 0
    const sTax = Number.parseFloat(item.sTax) || 0
    const disc1 = Number.parseFloat(item.disc1) || 0
    const disc2 = Number.parseFloat(item.disc2) || 0
    const gross = qty * price
    const afterDisc1 = gross - (gross * disc1) / 100
    const afterDisc2 = afterDisc1 - (afterDisc1 * disc2) / 100
    const afterTax = afterDisc2 + (afterDisc2 * sTax) / 100
    return Number.parseFloat(afterTax.toFixed(2))
  }, [])

  const handleItemChange = useCallback(
    (index, field, value) => {
      setInvoiceItems((prevItems) => {
        const updated = [...prevItems]
        updated[index] = { ...updated[index], [field]: value }
        updated[index].total = calculateItemTotal(updated[index])
        return updated
      })
    },
    [calculateItemTotal],
  )

  const addNewItem = useCallback(() => {
    setInvoiceItems((prev) => [
      ...prev,
      {
        itemCode: "",
        description: "",
        unit: "",
        batchNo: "",
        qty: 0,
        bonus: 0,
        return: 0,
        unitPrice: 0,
        sTax: 0,
        disc1: 0,
        disc2: 0,
        total: 0,
      },
    ])
  }, [])

  /* ---------- CALCULATIONS ---------- */
  const grossTotal = useMemo(() => {
    return invoiceItems.reduce((sum, item) => sum + (Number.parseFloat(item.total) || 0), 0)
  }, [invoiceItems])

  const calculateNetBalance = useCallback(() => {
    const other = Number.parseFloat(invoiceData.otherCharges) || 0
    const prev = Number.parseFloat(invoiceData.previousBalance) || 0
    const disc = Number.parseFloat(invoiceData.discount) || 0
    const paid = Number.parseFloat(invoiceData.amountReceived) || 0
    return Number.parseFloat((grossTotal + other + prev - disc - paid).toFixed(2))
  }, [grossTotal, invoiceData])

  const netBalance = useMemo(() => calculateNetBalance(), [calculateNetBalance])

  /* ---------- DATABASE OPERATIONS ---------- */
  const saveInvoiceToDatabase = useCallback(async () => {
    console.log("=== SAVE INVOICE DEBUG ===")
    console.log("Selected customer:", selectedCustomer)

    // Validation
    if (!selectedCustomer) {
      setError("Please select a customer.")
      return false
    }

    if (!selectedCustomer.id) {
      console.error("Customer ID is missing:", selectedCustomer)
      setError("Customer ID is missing. Please reselect the customer.")
      return false
    }

    if (invoiceItems.length === 0) {
      setError("Please add at least one item.")
      return false
    }

    // Validate that all items have required fields
    const invalidItems = invoiceItems.filter(
      (item) =>
        !item.itemCode?.trim() ||
        !item.description?.trim() ||
        !item.unit?.trim() ||
        Number.parseFloat(item.qty) <= 0 ||
        Number.parseFloat(item.unitPrice) <= 0,
    )

    if (invalidItems.length > 0) {
      setError(
        "Please fill in all required fields for all items (Item Code, Description, Unit, Qty > 0, Unit Price > 0).",
      )
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const payload = {
        invoiceNumber,
        invoiceDate: currentDate,
        customerId: selectedCustomer.id,
        customerCode: selectedCustomer.code,
        customerName: selectedCustomer.name,
        customerAddress: selectedCustomer.address || "",
        customerContact: selectedCustomer.contact || "",
        customerRegion: selectedCustomer.region || "",
        items: invoiceItems.map((item) => ({
          itemCode: item.itemCode?.trim() || "",
          description: item.description?.trim() || "",
          unit: item.unit?.trim() || "",
          batchNo: item.batchNo?.trim() || "",
          qty: Number.parseFloat(item.qty) || 0,
          bonus: Number.parseFloat(item.bonus) || 0,
          return: Number.parseFloat(item.return) || 0,
          unitPrice: Number.parseFloat(item.unitPrice) || 0,
          sTax: Number.parseFloat(item.sTax) || 0,
          disc1: Number.parseFloat(item.disc1) || 0,
          disc2: Number.parseFloat(item.disc2) || 0,
          total: Number.parseFloat(item.total) || 0,
        })),
        van: invoiceData.van?.trim() || "",
        bookingBy: invoiceData.bookingBy?.trim() || "",
        remarks: invoiceData.remarks?.trim() || "",
        otherCharges: Number.parseFloat(invoiceData.otherCharges) || 0,
        amountReceived: Number.parseFloat(invoiceData.amountReceived) || 0,
        discount: Number.parseFloat(invoiceData.discount) || 0,
        previousBalance: Number.parseFloat(invoiceData.previousBalance) || 0,
        grossTotal: Number.parseFloat(grossTotal.toFixed(2)),
        netBalance,
      }

      console.log("Payload being sent to backend:", payload)
      console.log("Customer ID being sent:", payload.customerId)

      const res = await fetch("http://localhost:5000/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      })

      console.log("Response status:", res.status)
      console.log("Response ok:", res.ok)

      if (!res.ok) {
        const errorResponse = await res.text()
        console.error("Backend error response:", errorResponse)

        // Try to parse as JSON for better error message
        try {
          const errorJson = JSON.parse(errorResponse)
          throw new Error(errorJson.message || errorResponse)
        } catch (parseError) {
          throw new Error(errorResponse || `Server error: ${res.status} ${res.statusText}`)
        }
      }

      const result = await res.json()
      console.log("Backend success response:", result)

      // Check if the response has the expected structure
      if (result.success && result.data) {
        return result.data
      } else if (result.data) {
        // Handle case where success field might be missing
        return result.data
      } else {
        throw new Error("Invalid response format from server")
      }
    } catch (err) {
      console.error("Save error:", err)
      setError(`Failed to save invoice: ${err.message}`)
      return false
    } finally {
      setLoading(false)
    }
  }, [selectedCustomer, invoiceItems, invoiceData, invoiceNumber, currentDate, grossTotal, netBalance])

  /* ---------- FORM ACTIONS ---------- */
  const handleSubmit = useCallback(async () => {
    const result = await saveInvoiceToDatabase()
    if (result) {
      alert("Invoice saved successfully!")
      console.log("Saved invoice:", result)
    }
  }, [saveInvoiceToDatabase])

  const resetForm = useCallback(() => {
    setSelectedCustomer(null)
    setInvoiceItems([])
    setInvoiceData({
      van: "",
      bookingBy: "",
      remarks: "",
      otherCharges: 0,
      amountReceived: 0,
      discount: 0,
      previousBalance: 0,
    })
    setError(null)
  }, [])

  /* ---------- PRINT FUNCTIONALITY ---------- */
  const generatePrintableInvoice = useCallback(() => {
    const formatCurrency = (amount) => {
      return `PKR ${Number.parseFloat(amount || 0).toLocaleString("en-PK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    }

    return `<!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoiceNumber}</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; line-height: 1.4; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .header h1 { font-size: 24px; margin-bottom: 10px; color: #333; }
        .header h2 { font-size: 18px; margin-bottom: 5px; color: #666; }
        .customer-info { margin-bottom: 20px; background-color: #f9f9f9; padding: 15px; border-radius: 5px; }
        .customer-info h3 { margin-bottom: 10px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        .invoice-details { margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; }
        .invoice-details p { background-color: #f5f5f5; padding: 8px; border-radius: 3px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
        .number-cell { text-align: right; }
        .totals { margin-top: 20px; background-color: #f9f9f9; padding: 15px; border-radius: 5px; }
        .totals p { margin-bottom: 5px; display: flex; justify-content: space-between; }
        .totals .final-total { font-size: 16px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; margin-top: 10px; }
        @media print {
          body { margin: 0; font-size: 11px; }
          .no-print { display: none !important; }
          .header { margin-bottom: 20px; }
          table { font-size: 9px; }
        }
        .no-print { margin-top: 30px; text-align: center; }
        .no-print button { margin: 0 10px; padding: 10px 20px; font-size: 14px; border: none; border-radius: 5px; cursor: pointer; }
        .print-btn { background-color: #007bff; color: white; }
        .close-btn { background-color: #6c757d; color: white; }
        .print-btn:hover { background-color: #0056b3; }
        .close-btn:hover { background-color: #545b62; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>SALES INVOICE</h1>
        <h2>Invoice #: ${invoiceNumber}</h2>
        <p><strong>Date: ${new Date(currentDate).toLocaleDateString("en-PK")}</strong></p>
      </div>
      <div class="customer-info">
        <h3>Customer Information</h3>
        <p><strong>Code:</strong> ${selectedCustomer?.code || "N/A"}</p>
        <p><strong>Name:</strong> ${selectedCustomer?.name || "N/A"}</p>
        <p><strong>Address:</strong> ${selectedCustomer?.address || "N/A"}</p>
        <p><strong>Contact:</strong> ${selectedCustomer?.contact || "N/A"}</p>
        <p><strong>Region:</strong> ${selectedCustomer?.region || "N/A"}</p>
      </div>
      <div class="invoice-details">
        <p><strong>Van:</strong> ${invoiceData.van || "N/A"}</p>
        <p><strong>Booking By:</strong> ${invoiceData.bookingBy || "N/A"}</p>
        <p><strong>Remarks:</strong> ${invoiceData.remarks || "N/A"}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 8%;">Item Code</th>
            <th style="width: 15%;">Description</th>
            <th style="width: 6%;">Unit</th>
            <th style="width: 8%;">Batch No</th>
            <th style="width: 6%;">Qty</th>
            <th style="width: 6%;">Bonus</th>
            <th style="width: 6%;">Return</th>
            <th style="width: 8%;">Unit Price</th>
            <th style="width: 6%;">S.Tax %</th>
            <th style="width: 6%;">Disc1 %</th>
            <th style="width: 6%;">Disc2 %</th>
            <th style="width: 10%;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${invoiceItems
            .map(
              (item) => `
          <tr>
              <td>${item.itemCode || ""}</td>
              <td>${item.description || ""}</td>
              <td>${item.unit || ""}</td>
              <td>${item.batchNo || ""}</td>
              <td class="number-cell">${Number.parseFloat(item.qty || 0).toLocaleString()}</td>
              <td class="number-cell">${Number.parseFloat(item.bonus || 0).toLocaleString()}</td>
              <td class="number-cell">${Number.parseFloat(item.return || 0).toLocaleString()}</td>
              <td class="number-cell">${formatCurrency(item.unitPrice)}</td>
              <td class="number-cell">${Number.parseFloat(item.sTax || 0)}%</td>
              <td class="number-cell">${Number.parseFloat(item.disc1 || 0)}%</td>
              <td class="number-cell">${Number.parseFloat(item.disc2 || 0)}%</td>
              <td class="number-cell"><strong>${formatCurrency(item.total)}</strong></td>
          </tr>
          `,
            )
            .join("")}
          ${
            invoiceItems.length === 0
              ? `
          <tr>
              <td colspan="12" style="text-align: center; padding: 20px; color: #666;">
                  No items in this invoice
              </td>
          </tr>
          `
              : ""
          }
        </tbody>
      </table>
      <div class="totals">
        <p><span>Gross Total:</span> <span><strong>${formatCurrency(grossTotal)}</strong></span></p>
        <p><span>Other Charges:</span> <span>${formatCurrency(invoiceData.otherCharges)}</span></p>
        <p><span>Previous Balance:</span> <span>${formatCurrency(invoiceData.previousBalance)}</span></p>
        <p><span>Discount:</span> <span>${formatCurrency(invoiceData.discount)}</span></p>
        <p><span>Amount Received:</span> <span>${formatCurrency(invoiceData.amountReceived)}</span></p>
        <p class="final-total"><span>Net Balance:</span> <span>${formatCurrency(netBalance)}</span></p>
      </div>
      <div class="no-print">
        <button class="print-btn" onclick="window.print()">🖨️ Print Invoice</button>
        <button class="close-btn" onclick="window.close()">❌ Close Window</button>
      </div>
      <script>
        window.onload = function() {
          window.focus()
        }
        window.onafterprint = function() {
          console.log('Print dialog closed')
        }
      </script>
    </body>
    </html>`
  }, [invoiceNumber, currentDate, selectedCustomer, invoiceData, invoiceItems, grossTotal, netBalance])

  const handlePrintInvoice = useCallback(async () => {
    try {
      // First save to database
      console.log("Saving invoice to database before printing...")
      const savedInvoice = await saveInvoiceToDatabase()
      if (!savedInvoice) {
        console.error("Failed to save invoice, aborting print")
        return
      }

      console.log("Invoice saved successfully, proceeding with print...")

      // Then trigger print
      const printWindow = window.open("", "_blank", "width=900,height=700,scrollbars=yes,resizable=yes")
      if (!printWindow || printWindow.closed || typeof printWindow.closed == "undefined") {
        setError("Popup blocked! Please allow popups for this site and try again.")
        return
      }

      const printContent = generatePrintableInvoice()
      printWindow.document.open()
      printWindow.document.write(printContent)
      printWindow.document.close()

      // Wait for content to load before printing
      const printTimeout = setTimeout(() => {
        if (printWindow && !printWindow.closed) {
          printWindow.focus()
          printWindow.print()
        }
      }, 1000)

      // Clean up timeout if window closes
      printWindow.onbeforeunload = () => clearTimeout(printTimeout)

      alert("Invoice saved and print dialog opened!")
    } catch (error) {
      console.error("Print error:", error)
      setError(`Print error: ${error.message}. Please try again or check your browser settings.`)
    }
  }, [saveInvoiceToDatabase, generatePrintableInvoice])

  /* ---------- LOAD INVOICE ---------- */
  const handleLoadInvoice = useCallback(async () => {
    if (!searchInvoice.trim()) {
      setError("Please enter an invoice number to search.")
      return
    }
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`http://localhost:5000/api/invoices/number/${searchInvoice.trim()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      if (!res.ok) {
        if (res.status === 404) {
          setError("Invoice not found.")
        } else {
          const errorText = await res.text()
          throw new Error(`Failed to load invoice: ${errorText}`)
        }
        return
      }

      const response = await res.json()
      console.log("Load invoice response:", response)

      // Handle the backend response structure { success: true, data: invoice }
      if (!response.success || !response.data) {
        throw new Error("Invalid response format from server")
      }

      const invoice = response.data

      // Load the invoice data into the form
      setSelectedCustomer({
        id: invoice.customerId,
        code: invoice.customerCode,
        name: invoice.customerName,
        address: invoice.customerAddress || "",
        contact: invoice.customerContact || "",
        region: invoice.customerRegion || "",
      })
      setInvoiceItems(invoice.items || [])
      setInvoiceData({
        van: invoice.van || "",
        bookingBy: invoice.bookingBy || "",
        remarks: invoice.remarks || "",
        otherCharges: invoice.otherCharges || 0,
        amountReceived: invoice.amountReceived || 0,
        discount: invoice.discount || 0,
        previousBalance: invoice.previousBalance || 0,
      })
      alert("Invoice loaded successfully!")
    } catch (err) {
      console.error("Load invoice error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [searchInvoice])

  /* ---------- RENDER ---------- */
  return (
    <div className="bg-white min-h-screen px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">Sales Invoice</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
          <button onClick={() => setError(null)} className="float-right text-red-700 hover:text-red-900">
            ✕
          </button>
        </div>
      )}
      {loading && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
            Loading...
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Code */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Customer Code *</label>
          <select
            value={selectedCustomer?.code || ""}
            onChange={handleCustomerCodeChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={loading}
          >
            <option value="">Select customer code</option>
            {customers.map((c) => (
              <option key={c._id} value={c.accountCode}>
                {c.accountCode} - {c.description}
              </option>
            ))}
          </select>
        </div>
        {/* Customer Name */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Customer Name</label>
          <input
            type="text"
            value={selectedCustomer?.name || ""}
            readOnly
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
          />
        </div>
        {/* Address */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Address</label>
          <input
            type="text"
            value={selectedCustomer?.address || ""}
            readOnly
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
          />
        </div>
        {/* Contact No */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Contact No</label>
          <input
            type="text"
            value={selectedCustomer?.contact || ""}
            readOnly
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
          />
        </div>
        {/* Van */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Van</label>
          <input
            type="text"
            value={invoiceData.van}
            onChange={(e) => setInvoiceData({ ...invoiceData, van: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {/* Booking By */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Booking By</label>
          <input
            type="text"
            value={invoiceData.bookingBy}
            onChange={(e) => setInvoiceData({ ...invoiceData, bookingBy: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {/* Remarks */}
        <div className="md:col-span-2">
          <label className="block mb-1 font-medium text-gray-700">Remarks</label>
          <input
            type="text"
            value={invoiceData.remarks}
            onChange={(e) => setInvoiceData({ ...invoiceData, remarks: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* ----------  BILLING SECTION  ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div>
          <label className="block mb-1 font-medium text-gray-700">Other Charges</label>
          <input
            type="number"
            step="0.01"
            value={invoiceData.otherCharges}
            onChange={(e) =>
              setInvoiceData({
                ...invoiceData,
                otherCharges: e.target.value,
              })
            }
            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">Amount Received</label>
          <input
            type="number"
            step="0.01"
            value={invoiceData.amountReceived}
            onChange={(e) =>
              setInvoiceData({
                ...invoiceData,
                amountReceived: e.target.value,
              })
            }
            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">Discount</label>
          <input
            type="number"
            step="0.01"
            value={invoiceData.discount}
            onChange={(e) => setInvoiceData({ ...invoiceData, discount: e.target.value })}
            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">Previous Balance</label>
          <input
            type="number"
            step="0.01"
            value={invoiceData.previousBalance}
            onChange={(e) =>
              setInvoiceData({
                ...invoiceData,
                previousBalance: e.target.value,
              })
            }
            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">Gross Total</label>
          <input
            type="text"
            value={`PKR ${grossTotal.toLocaleString("en-PK", { minimumFractionDigits: 2 })}`}
            readOnly
            className="w-full border rounded-md px-3 py-2 bg-gray-100 font-semibold"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">Net Balance</label>
          <input
            type="text"
            value={`PKR ${calculateNetBalance().toLocaleString("en-PK", { minimumFractionDigits: 2 })}`}
            readOnly
            className="w-full border rounded-md px-3 py-2 bg-green-100 font-bold text-green-800"
          />
        </div>
      </div>

      {/* ----------  SEARCH ROW  ---------- */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search Invoice */}
        <div className="relative">
          <label className="block mb-1 font-medium text-gray-700">Search Invoice</label>
          <div className="flex">
            <input
              type="text"
              value={searchInvoice}
              onChange={(e) => setSearchInvoice(e.target.value)}
              placeholder="Enter invoice number..."
              className="border border-gray-300 rounded-l-md px-4 py-2 pl-10 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={handleLoadInvoice}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md disabled:opacity-50"
            >
              Load
            </button>
          </div>
          <svg
            className="absolute left-3 top-9 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {/* Search Report */}
        <div className="relative">
          <label className="block mb-1 font-medium text-gray-700">Search Report</label>
          <div className="flex">
            <input
              type="text"
              value={searchReport}
              onChange={(e) => setSearchReport(e.target.value)}
              placeholder="Search reports..."
              className="border border-gray-300 rounded-l-md px-4 py-2 pl-10 w-full focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
            />
            <button type="button" className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-r-md">
              Search
            </button>
          </div>
          <svg
            className="absolute left-3 top-9 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* ----------  BUTTONS  ---------- */}
      <div className="mt-6 flex gap-4 flex-wrap">
        <button
          type="button"
          onClick={resetForm}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          🆕 New Invoice
        </button>
        <button
          type="button"
          onClick={addNewItem}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded transition-colors"
        >
          ➕ Add Item
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !selectedCustomer || invoiceItems.length === 0}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "💾 Saving..." : "💾 Save Invoice"}
        </button>
        <button
          type="button"
          onClick={handlePrintInvoice}
          disabled={loading || !selectedCustomer || invoiceItems.length === 0}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "🖨️ Saving & Printing..." : "🖨️ Print Invoice"}
        </button>
      </div>

      {/* ----------  TABLE  ---------- */}
      <div className="mt-10 overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm text-gray-700">
          <thead className="bg-gray-100">
            <tr>
              {[
                "Item Code *",
                "Description *",
                "Unit *",
                "Batch No",
                "Qty *",
                "Bonus",
                "Return",
                "Unit Price *",
                "S.Tax %",
                "Disc1 %",
                "Disc2 %",
                "Total",
                "Action",
              ].map((h) => (
                <th key={h} className="border px-3 py-2 whitespace-nowrap font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoiceItems.map((item, r) => (
              <tr key={r} className="hover:bg-gray-50">
                {[
                  { key: "itemCode", type: "text", required: true },
                  { key: "description", type: "text", required: true },
                  { key: "unit", type: "text", required: true },
                  { key: "batchNo", type: "text" },
                  { key: "qty", type: "number", min: 0, step: 1, required: true },
                  { key: "bonus", type: "number", min: 0, step: 1 },
                  { key: "return", type: "number", min: 0, step: 1 },
                  { key: "unitPrice", type: "number", min: 0, step: 0.01, required: true },
                  { key: "sTax", type: "number", min: 0, max: 100, step: 0.01 },
                  { key: "disc1", type: "number", min: 0, max: 100, step: 0.01 },
                  { key: "disc2", type: "number", min: 0, max: 100, step: 0.01 },
                ].map((col, c) => (
                  <td key={col.key} className="border px-2 py-1">
                    <input
                      type={col.type}
                      value={item[col.key]}
                      min={col.min}
                      max={col.max}
                      step={col.step}
                      required={col.required}
                      onChange={(e) => handleItemChange(r, col.key, e.target.value)}
                      className={`w-full border-none outline-none bg-transparent text-sm focus:bg-blue-50 ${
                        col.required && !item[col.key] ? "bg-red-50" : ""
                      }`}
                      style={{
                        MozAppearance: "textfield",
                        appearance: "textfield",
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                          e.preventDefault()
                        }
                      }}
                      placeholder={col.required ? "Required" : ""}
                    />
                  </td>
                ))}
                {/* Total column */}
                <td className="border px-3 py-1 font-semibold text-right bg-green-50">
                  PKR {item.total.toLocaleString("en-PK", { minimumFractionDigits: 2 })}
                </td>
                {/* Remove */}
                <td className="border px-2 py-1 text-center">
                  <button
                    type="button"
                    onClick={() => setInvoiceItems(invoiceItems.filter((_, i) => i !== r))}
                    className="text-red-600 hover:text-red-800 hover:bg-red-100 rounded px-2 py-1 transition-colors"
                    title="Remove item"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
            {invoiceItems.length === 0 && (
              <tr>
                <td colSpan={13} className="text-center py-8 text-gray-500">
                  No items added. Click "Add Item" to start adding products.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Invoice Summary */}
      {invoiceItems.length > 0 && (
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Invoice Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Items:</span>
              <span className="font-semibold ml-2">{invoiceItems.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Total Quantity:</span>
              <span className="font-semibold ml-2">
                {invoiceItems.reduce((sum, item) => sum + (Number.parseFloat(item.qty) || 0), 0)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Gross Total:</span>
              <span className="font-semibold ml-2">
                PKR {grossTotal.toLocaleString("en-PK", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Net Balance:</span>
              <span className="font-bold ml-2 text-green-600">
                PKR {calculateNetBalance().toLocaleString("en-PK", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Debug Information */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-6 bg-gray-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Debug Information</h3>
          <div className="text-sm text-gray-600">
            <p>
              <strong>Backend URL:</strong> http://localhost:5000
            </p>
            <p>
              <strong>Customers loaded:</strong> {customers.length}
            </p>
            <p>
              <strong>Selected customer:</strong> {selectedCustomer ? selectedCustomer.name : "None"}
            </p>
            <p>
              <strong>Invoice items:</strong> {invoiceItems.length}
            </p>
            <p>
              <strong>Current invoice number:</strong> {invoiceNumber}
            </p>
          </div>
        </div>
      )}

      {/* Customer Debug Information */}
      {selectedCustomer && (
        <div className="mt-4 bg-yellow-100 p-4 rounded-lg">
          <h4 className="text-lg font-semibold mb-2">Selected Customer Debug</h4>
          <div className="text-sm text-gray-600">
            <p>
              <strong>Customer ID:</strong> {selectedCustomer.id}
            </p>
            <p>
              <strong>Customer Code:</strong> {selectedCustomer.code}
            </p>
            <p>
              <strong>Customer Name:</strong> {selectedCustomer.name}
            </p>
            <p>
              <strong>Address:</strong> {selectedCustomer.address}
            </p>
            <p>
              <strong>Contact:</strong> {selectedCustomer.contact}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
