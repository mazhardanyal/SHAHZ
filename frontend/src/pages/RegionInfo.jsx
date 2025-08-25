import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

export default function RegionInfo() {
  const [regions, setRegions] = useState([]);
  const [newRegion, setNewRegion] = useState({ name: "", code: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRegions = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/regions");
      setRegions(res.data);
    } catch (err) {
      toast.error("Failed to fetch regions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/regions/${editingId}`, newRegion);
        toast.success("Region updated!");
      } else {
        await axios.post("http://localhost:5000/api/regions", newRegion);
        toast.success("Region added!");
      }
      setNewRegion({ name: "", code: "" });
      setEditingId(null);
      fetchRegions();
    } catch (err) {
      toast.error("Error saving region.");
    }
  };

  const handleEdit = (region) => {
    setNewRegion({ name: region.name, code: region.code });
    setEditingId(region._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this region?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/regions/${id}`);
      toast.success("Region deleted!");
      fetchRegions();
    } catch (err) {
      toast.error("Error deleting region.");
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-gray-800 border-b pb-2">Regions</h1>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">{editingId ? "Edit" : "Add"} Region</h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Region Name"
            className="border p-2 rounded"
            value={newRegion.name}
            onChange={(e) => setNewRegion({ ...newRegion, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Region Code"
            className="border p-2 rounded"
            value={newRegion.code}
            onChange={(e) => setNewRegion({ ...newRegion, code: e.target.value })}
            required
          />
        </div>
        
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {editingId ? "Update" : "Add"} Region
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setNewRegion({ name: "", code: "" });
            }}
            className="mt-4 ml-4 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
          >
            Cancel
          </button>
        )}
      </form>

      {/* Region Table */}
      <div className="bg-white shadow rounded overflow-x-auto">
        {loading ? (
          <p className="p-4">Loading...</p>
        ) : (
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">#</th>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Code</th>
                <th className="px-4 py-2 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {regions.map((region, index) => (
                <tr key={region._id} className="bg-white hover:bg-slate-50">
                  <td className="px-4 py-2 border">{index + 1}</td>
                  <td className="px-4 py-2 border">{region.name}</td>
                  <td className="px-4 py-2 border">{region.code}</td>
                  <td className="px-4 py-2 border text-center space-x-2">
                    <button
                      onClick={() => handleEdit(region)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(region._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {regions.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-400">
                    No regions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
