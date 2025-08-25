import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Edit, Upload } from "lucide-react";
import axios from "axios";
import { toast } from "sonner"; // optional toast, install with `npm i sonner`

export default function VanInfo() {
  const [vans, setVans] = useState([]);
  const [newVan, setNewVan] = useState({
    vanNumber: "",
    plateNumber: "",
    image: null,
  });
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch vans from DB
  useEffect(() => {
    fetchVans();
  }, []);

  const fetchVans = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/vans");
      setVans(res.data);
    } catch (err) {
      toast.error("Failed to load vans");
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVan({ ...newVan, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewVan((prev) => ({
          ...prev,
          image: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addVan = async () => {
    if (!newVan.vanNumber || !newVan.plateNumber) {
      toast.error("Van number and plate are required!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/vans", newVan);
      setVans([...vans, res.data]); // append new van from DB
      setNewVan({ vanNumber: "", plateNumber: "", image: null });
      setShowModal(false);
      toast.success("Van added successfully!");
    } catch (err) {
      toast.error("Failed to save van.");
      console.error(err.response?.data || err.message);
    }
  };

 const deleteVan = async (id) => {
  try {
   await axios.delete(`http://localhost:5000/api/vans/${id}`);

    setVans(vans.filter((van) => van._id !== id)); // remove from UI
    toast.success("Van deleted successfully!");
  } catch (err) {
    toast.error("Failed to delete van");
    console.error(err);
  }
};

  return (
    <div className="bg-white min-h-screen px-6 py-8">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">Van Information</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          <Plus className="h-5 w-5" />
          Add Van
        </button>
      </div>

      {/* Van Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm text-gray-700">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-3 text-left">Van ID</th>
              <th className="border px-4 py-3 text-left">Van Number</th>
              <th className="border px-4 py-3 text-left">Plate Number</th>
              <th className="border px-4 py-3 text-left">Image</th>
              <th className="border px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vans.length > 0 ? (
              vans.map((van) => (
                <tr key={van._id}>
                  <td className="border px-4 py-3">{van._id}</td>
                  <td className="border px-4 py-3">{van.vanNumber}</td>
                  <td className="border px-4 py-3">{van.plateNumber}</td>
                  <td className="border px-4 py-3">
                    <img
                      src={van.image || "/van-placeholder.jpg"}
                      alt={van.vanNumber}
                      className="h-12 w-12 object-cover rounded"
                    />
                  </td>
                  <td className="border px-4 py-3">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-800 p-1">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteVan(van._id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-gray-500 py-4">
                  No vans found. Add your first van.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Van Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Add New Van</h2>

              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium text-gray-700">
                    Van Number
                  </label>
                  <input
                    type="text"
                    name="vanNumber"
                    value={newVan.vanNumber}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g. VAN-001"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-gray-700">
                    Plate Number
                  </label>
                  <input
                    type="text"
                    name="plateNumber"
                    value={newVan.plateNumber}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g. ABC-123"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-gray-700">
                    Van Image
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Image
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    {newVan.image && (
                      <img
                        src={newVan.image}
                        alt="Van preview"
                        className="h-12 w-12 object-cover rounded"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addVan}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Van
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
