import { useState, useEffect } from "react";
import { Trash2, KeyRound, Users, Lock, Plus, X } from "lucide-react";

export default function Settings() {
  // Dummy user data (later from DB/API)
  const [users, setUsers] = useState([
    { id: 1, name: "Admin (You)", role: "admin" },
    { id: 2, name: "John Doe", role: "user" },
    { id: 3, name: "Jane Smith", role: "user" },
  ]);

  // Add User Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", role: "user" });

  // Password change state (for self)
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Toast message state
  const [message, setMessage] = useState("");

  // Auto-hide toast
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Handle own password change
  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("❌ New passwords do not match!");
      return;
    }
    setMessage("✅ Password changed successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // Handle delete user
  const handleDeleteUser = (id) => {
    setUsers(users.filter((user) => user.id !== id));
    setMessage(`🗑️ User with ID ${id} deleted!`);
  };

  // Handle reset password for another user
  const handleResetPassword = (id) => {
    setMessage(`🔑 Password for User ID ${id} reset (simulate API call).`);
  };

  // Handle add new user
  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.name.trim()) {
      setMessage("⚠️ Name is required!");
      return;
    }
    setUsers([...users, { id: Date.now(), ...newUser }]);
    setMessage(`✅ User "${newUser.name}" added!`);
    setNewUser({ name: "", role: "user" });
    setIsModalOpen(false);
  };

  return (
    <div className="p-8 space-y-10 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Title */}
      <div>
        <h1 className="text-4xl font-bold text-gray-800"> Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account and system preferences.
        </p>
      </div>

      {/* Users Section */}
      <section className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-800">
              Users in the System
            </h2>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Plus className="h-4 w-4" />
            Add User
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          Total Users:{" "}
          <span className="font-medium text-gray-900">{users.length}</span>
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-700">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition border-b last:border-0"
                >
                  <td className="py-3 px-4 font-medium text-gray-800">
                    {user.name}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        user.role === "admin"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {user.role !== "admin" && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleResetPassword(user.id)}
                          className="flex items-center gap-1 px-3 py-1 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                        >
                          <KeyRound className="h-4 w-4" />
                          Reset
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="flex items-center gap-1 px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Password Change Section */}
      <section className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <Lock className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-semibold text-gray-800">
            Change Your Password
          </h2>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-5">
          <div>
            <label className="block text-gray-700 text-sm mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Update Password
          </button>
        </form>
      </section>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-semibold mb-4">Add New User</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Add User
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toast Message */}
      {message && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg animate-fade-in">
          {message}
        </div>
      )}
    </div>
  );
}