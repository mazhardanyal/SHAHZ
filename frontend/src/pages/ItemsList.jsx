// frontend/src/components/ItemList.jsx

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'sonner';

export default function ItemList() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    description: "",
    unit: "",
    batchNo: "",
    expDate: "",
    unitPrice: "",
    subCompany: "",
    inactive: false,
  });
  const [loading, setLoading] = useState(false);

  // Fetch items on first load
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/items");
      setItems(res.data);
    } catch (err) {
      console.error("Error fetching items:", err);
    } finally {
      setLoading(false);
    }
  };

 // ✅ ADD
const handleAddItem = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post("http://localhost:5000/api/items", newItem);
    setItems((prev) => [...prev, res.data]);
    setNewItem({
      description: "",
      unit: "",
      batchNo: "",
      expDate: "",
      unitPrice: "",
      subCompany: "",
      inactive: false,
    });
    toast.success(" Item added successfully!");
  } catch (err) {
    toast.error("❌ Failed to add item!");
    console.error(err);
  }
};

// ✅ DELETE
const deleteItem = async (id) => {
  if (!window.confirm("Are you sure you want to delete this item?")) return;
  try {
    await axios.delete(`http://localhost:5000/api/items/${id}`);
    setItems((prev) => prev.filter((item) => item._id !== id));
    toast.success(" Item deleted successfully!");
  } catch (err) {
    toast.error("❌ Failed to delete item!");
    console.error(err);
  }
};

// ✅ TOGGLE
const toggleInactive = async (id, currentStatus) => {
  try {
    await axios.put(`http://localhost:5000/api/items/${id}`, {
      inactive: !currentStatus,
    });
    setItems((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, inactive: !currentStatus } : item
      )
    );
    toast.success(`✔️ Marked as ${!currentStatus ? "inactive" : "active"}`);
  } catch (err) {
    toast.error("❌ Failed to update status!");
    console.error(err);
  }
};


  return (
    <div className="p-8 min-h-screen bg-gradient-to-r from-slate-50 to-slate-100">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">
        All Product Items
      </h1>

      {/* 🔹 New Item Form */}
      <form
        onSubmit={handleAddItem}
        className="mb-6 bg-white p-4 rounded-lg shadow"
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Item</h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Description"
            className="border p-2 rounded"
            value={newItem.description}
            onChange={(e) =>
              setNewItem({ ...newItem, description: e.target.value })
            }
            required
          />
          <input
            type="text"
            placeholder="Unit"
            className="border p-2 rounded"
            value={newItem.unit}
            onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
          />
          <input
            type="text"
            placeholder="Batch No"
            className="border p-2 rounded"
            value={newItem.batchNo}
            onChange={(e) => setNewItem({ ...newItem, batchNo: e.target.value })}
          />
          <input
            type="date"
            className="border p-2 rounded"
            value={newItem.expDate}
            onChange={(e) => setNewItem({ ...newItem, expDate: e.target.value })}
          />
          <input
            type="number"
            placeholder="Unit Price"
            className="border p-2 rounded"
            value={newItem.unitPrice}
            onChange={(e) =>
              setNewItem({
                ...newItem,
                unitPrice: parseFloat(e.target.value) || "",
              })
            }
          />
          <input
            type="text"
            placeholder="Sub Company"
            className="border p-2 rounded"
            value={newItem.subCompany}
            onChange={(e) =>
              setNewItem({ ...newItem, subCompany: e.target.value })
            }
          />
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={newItem.inactive}
              onChange={(e) =>
                setNewItem({ ...newItem, inactive: e.target.checked })
              }
            />
            <span>Inactive?</span>
          </label>
        </div>
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Item
        </button>
      </form>

      {/* 🔹 Item Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto shadow border rounded-lg bg-white">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-100 text-gray-800">
              <tr>
                <th className="px-4 py-2 border">#</th>
                <th className="px-4 py-2 border">Item Code</th>
                <th className="px-4 py-2 border">Description</th>
                <th className="px-4 py-2 border">Unit</th>
                <th className="px-4 py-2 border">Batch No</th>
                <th className="px-4 py-2 border">Expiry Date</th>
                <th className="px-4 py-2 border">Unit Price</th>
                <th className="px-4 py-2 border">Sub Company</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={item._id}
                  className={item.inactive ? "bg-red-50" : "bg-white"}
                >
                  <td className="px-4 py-2 border">{index + 1}</td>
                  <td className="px-4 py-2 border">{item.code}</td>
                  <td className="px-4 py-2 border">{item.description}</td>
                  <td className="px-4 py-2 border">{item.unit}</td>
                  <td className="px-4 py-2 border">{item.batchNo}</td>
                  <td className="px-4 py-2 border">{item.expDate}</td>
                  <td className="px-4 py-2 border">
                    PKR {item.unitPrice?.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 border">{item.subCompany}</td>
                  <td className="px-4 py-2 border text-center">
                    <input
                      type="checkbox"
                      checked={item.inactive}
                      onChange={() => toggleInactive(item._id, item.inactive)}
                      className="accent-red-800"
                    />
                  </td>
                  <td className="px-4 py-2 border text-center">
                    <button
                      onClick={() => deleteItem(item._id)}
                      className="text-red-600 hover:text-red-800 font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
