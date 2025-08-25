import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

export default function CompanyInfo() {
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contactNo: "",
    email: "",
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/companies");
      setCompanies(res.data);
    } catch (err) {
      toast.error("❌ Failed to load companies.");
      console.error(err);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAddCompany = async () => {
    const { name, contactNo } = formData;

    if (!name || !contactNo) {
      toast.error("⚠️ Company Name and Mobile Number are required!");
      return;
    }

    if (!/^\d{11}$/.test(contactNo)) {
      toast.error("📵 Mobile number must be exactly 11 digits.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/companies", formData);
      toast.success("✅ Company added successfully!");
      fetchCompanies();
      setFormData({ name: "", address: "", contactNo: "", email: "" });
    } catch (err) {
      toast.error("❌ Failed to add company.");
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-r from-gray-50 to-gray-100">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">
         Company Information
      </h1>

      {/* === FORM === */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-white p-6 rounded shadow">
        {/* Company Name */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Company Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Company Name"
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Mobile Number */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">
            Mobile Number *
          </label>
          <input
            type="tel"
            value={formData.contactNo}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ""); // Only digits
              handleChange("contactNo", value);
            }}
            className={`w-full border px-3 py-2 rounded ${
              formData.contactNo && formData.contactNo.length !== 11
                ? "border-red-500"
                : "border-gray-300"
            }`}
            maxLength={11}
            placeholder="e.g., 03001234567"
          />
          {formData.contactNo && formData.contactNo.length !== 11 && (
            <p className="text-red-500 text-sm mt-1">
              Must be 11 digits only.
            </p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            placeholder="Company Address"
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block mb-1 font-semibold text-gray-700">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="company@email.com"
            className="w-full border px-3 py-2 rounded"
          />
        </div>
      </div>

      {/* === BUTTONS === */}
      <div className="mt-4 flex gap-4 flex-wrap">
        <button
          type="button"
          onClick={handleAddCompany}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
           Add Company
        </button>
        <button
          type="button"
          onClick={() =>
            setFormData({ name: "", address: "", contactNo: "", email: "" })
          }
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Clear
        </button>
      </div>

      {/* === TABLE === */}
      <div className="mt-10 overflow-x-auto shadow-lg border rounded-lg bg-white">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 text-gray-800">
            <tr>
              <th className="px-4 py-2 border">Company ID</th>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Address</th>
              <th className="px-4 py-2 border">Mobile</th>
              <th className="px-4 py-2 border">Email</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((comp, index) => (
              <tr key={comp._id || index}>
                <td className="px-4 py-2 border">{comp.companyId}</td>
                <td className="px-4 py-2 border">{comp.name}</td>
                <td className="px-4 py-2 border">{comp.address}</td>
                <td className="px-4 py-2 border">{comp.contactNo}</td>
                <td className="px-4 py-2 border">{comp.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
