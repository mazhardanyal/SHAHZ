import { useState } from "react";

export default function DistributionReport() {
  const [formData, setFormData] = useState({
    accountName: "",
    regionName: "",
    company: "",
    itemCode: "",
    vanName: "",
    fromDate: "",
    toDate: "",
    selectedReport: "",
  });

  const reportOptions = [
    { value: "", label: "Select Report" },
    { value: "daily-distribution", label: "Daily Distribution" },
    { value: "van-wise", label: "Van-Wise Report" },
    { value: "item-summary", label: "Item Summary" },
    { value: "region-analysis", label: "Region Analysis" },
  ];

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Distribution Report Data:", formData);
    alert("Distribution Report Filters Applied");
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-md max-w-5xl mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-3">
        Distribution Report
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Account Name
          </label>
          <input
            type="text"
            value={formData.accountName}
            onChange={(e) => handleChange("accountName", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Enter account name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Region Name
          </label>
          <input
            type="text"
            value={formData.regionName}
            onChange={(e) => handleChange("regionName", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Enter region"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Company
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => handleChange("company", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Enter company name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Item Code
          </label>
          <input
            type="text"
            value={formData.itemCode}
            onChange={(e) => handleChange("itemCode", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Enter item code"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Van Name
          </label>
          <input
            type="text"
            value={formData.vanName}
            onChange={(e) => handleChange("vanName", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Enter van name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            From Date
          </label>
          <input
            type="date"
            value={formData.fromDate}
            onChange={(e) => handleChange("fromDate", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            To Date
          </label>
          <input
            type="date"
            value={formData.toDate}
            onChange={(e) => handleChange("toDate", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Select Report
          </label>
          <select
            value={formData.selectedReport}
            onChange={(e) => handleChange("selectedReport", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            {reportOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 flex justify-end mt-4">
          <button
            type="submit"
            className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 transition"
          >
            Generate Report
          </button>
        </div>
      </form>
    </div>
  );
}
