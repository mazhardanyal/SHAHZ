// src/pages/AccountInfo.jsx
import { toast } from 'sonner';
import { useState, useEffect } from "react";
import axios from "axios";
import { ChevronDown } from "lucide-react";

export default function AccountInfo() {
  const accountTypes = ["Cash", "Credit", "Bank", "Supplier", "Customer"];
  const customerTypes = ["Retail", "Wholesale", "Corporate", "Government"];
 const [regions, setRegions] = useState([]);

 useEffect(() => {
   axios
     .get("http://localhost:5000/api/regions")
     .then((res) => setRegions(res.data.map((r) => r.name))) // keep only name
     .catch(() => setRegions([]));                           // silent fallback
}, []);

  const [loading, setLoading] = useState(false);
  const [newAccount, setNewAccount] = useState({
  accountType: "",
  accountCode: "",
  description: "",
  address: "",
  contactNo: "",
  mobile: "", // Changed from cellNo to match your input
  region: "",
  customerType: "",
  inactive: false,
});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAccount((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addAccount = async () => {
  try {
    if (!newAccount.accountType || !newAccount.description) {
      toast.error("Please fill in required fields.");
      return;
    }

    setLoading(true);
    
    // Map frontend fields to backend expectations
    const payload = {
      accountType: newAccount.accountType,
      description: newAccount.description,
      address: newAccount.address,
      contactNumber: newAccount.contactNo, // Map to backend field name
      cellNumber: newAccount.mobile,       // If you need this
      region: newAccount.region,
      customerType: newAccount.customerType,
      inactive: newAccount.inactive
    };

    const response = await axios.post(
      "http://localhost:5000/api/accounts", 
      payload
    );

    if (response.status === 201) {
      toast.success("Account saved successfully!");
      // Reset form
      setNewAccount({
        accountType: "",
        accountCode: "",
        description: "",
        address: "",
        contactNo: "",
        mobile: "",
        region: "",
        customerType: "",
        inactive: false,
      });
    }
  } catch (err) {
    console.error("Error saving account:", err);
    toast.error(`Failed to save account: ${err.response?.data?.message || err.message}`);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="bg-white min-h-screen px-6 py-8">
      <h1 className="text-3xl font-bold mb-6 border-b pb-4 text-gray-800">
        Add Account Information
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
        {/* Account Type */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Account Type*</label>
          <div className="relative">
            <select
              name="accountType"
              value={newAccount.accountType}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 appearance-none"
            >
              <option value="">Select Type</option>
              {accountTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Description*</label>
          <input
            type="text"
            name="description"
            value={newAccount.description}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="block mb-1 font-medium text-gray-700">Address</label>
          <input
            type="text"
            name="address"
            value={newAccount.address}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        {/* Contact No */}
       <div>
  <label className="block mb-1 font-medium text-gray-700">Mobile Number</label>

<input
  type="tel"  
  name="contactNo" // Changed from "mobile" to match your state
  value={newAccount.contactNo || ''} // Ensure it's never undefined
  onChange={handleInputChange}
  className={`w-full border rounded-md px-3 py-2 ${
    newAccount.contactNo && newAccount.contactNo.length !== 11 
      ? "border-red-500" 
      : "border-gray-300"
  }`}
  inputMode="numeric"
  placeholder="e.g., 03001234567"
  maxLength={11}
  onKeyPress={(e) => {
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  }}
/>
{newAccount.contactNo && newAccount.contactNo.length !== 11 && (
  <p className="text-red-500 text-sm mt-1">
    Mobile number must be 11 digits.
  </p>
)}
</div>
        {/* Region */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Region</label>
          <div className="relative">
            <select
              name="region"
              value={newAccount.region}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 appearance-none"
            >
              <option value="">Select Region</option>
              {regions.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Customer Type */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Customer Type</label>
          <div className="relative">
            <select
              name="customerType"
              value={newAccount.customerType}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 appearance-none"
            >
              <option value="">Select</option>
              {customerTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Inactive Checkbox */}
        <div className="flex items-center mt-4 md:col-span-2">
          <input
            type="checkbox"
            name="inactive"
            checked={newAccount.inactive}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600"
          />
          <label className="ml-2 text-gray-700">Mark as Inactive</label>
        </div>

        {/* Save Button */}
        <div className="md:col-span-2 mt-4 flex justify-end">
          <button
            onClick={addAccount}
            disabled={loading}
            className={`px-4 py-2 ${
              loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            } text-white rounded-md`}
          >
            {loading ? "Saving..." : "Save Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
