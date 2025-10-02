import React, { useEffect, useState } from "react";
import API from "../utils/api";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);

  // ✅ Fetch customers
  const fetchCustomers = async () => {
    try {
      const res = await API.get("/customers");
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch customers");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // ✅ Handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Add / Update customer
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await API.put(`/customers/${editingId}`, form);
      } else {
        await API.post("/customers", form);
      }
      setForm({ name: "", email: "", phone: "" });
      setEditingId(null);
      fetchCustomers();
      setError(""); // Clear any previous errors
    } catch (err) {
      console.error(err);
      setError("Failed to save customer");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Edit customer
  const handleEdit = (customer) => {
    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    });
    setEditingId(customer.customer_id);
  };

  // ✅ Delete customer
  const handleDelete = async (id, customerName) => {
    if (!window.confirm(`Are you sure you want to delete "${customerName}"?`)) {
      return;
    }

    try {
      await API.delete(`/customers/${id}`);
      fetchCustomers();
    } catch (err) {
      console.error(err);
      setError("Failed to delete customer");
    }
  };

  // ✅ Upload customer profile picture
  const handleUpload = async (id, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPG, PNG, GIF, WebP)");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setUploadingId(id);
    setError(""); // Clear any previous errors

    try {
      await API.post(`/customers/${id}/upload-picture`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchCustomers();
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.response?.data?.message || "Failed to upload picture");
    } finally {
      setUploadingId(null);
      // Clear the file input
      e.target.value = "";
    }
  };

  // ✅ Cancel edit
  const handleCancelEdit = () => {
    setForm({ name: "", email: "", phone: "" });
    setEditingId(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">👤 Customers</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* ✅ Customer Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow p-4 rounded mb-6"
      >
        <div className="grid grid-cols-3 gap-3">
          <input
            type="text"
            name="name"
            placeholder="Customer Name"
            value={form.name}
            onChange={handleChange}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          />
        </div>
        <div className="mt-3 space-x-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {editingId
              ? loading
                ? "Updating..."
                : "Update Customer"
              : loading
              ? "Adding..."
              : "Add Customer"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={loading}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* ✅ Customers Table */}
      <div className="bg-white shadow rounded overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">Profile Picture</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.customer_id} className="border-t hover:bg-gray-50">
              {console.log(c)}
                <td className="p-3">
                  <div className="flex flex-col items-center space-y-2">
                    {/* Profile Picture Display */}
                    {c.picture_url ? (
                      <img
                        src={`http://localhost:3000${c.picture_url}`}
                        alt={c.name}
                        className="w-16 h-16 object-cover rounded-full border-2 border-gray-300"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-full border-2 border-gray-300 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">No photo</span>
                      </div>
                    )}

                    {/* Upload Button */}
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUpload(c.customer_id, e)}
                        className="hidden"
                        disabled={uploadingId === c.customer_id}
                      />
                      <span
                        className={`text-xs px-2 py-1 rounded text-white ${
                          uploadingId === c.customer_id
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                      >
                        {uploadingId === c.customer_id
                          ? "Uploading..."
                          : "Upload"}
                      </span>
                    </label>
                  </div>
                </td>
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3">{c.email}</td>
                <td className="p-3">{c.phone}</td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => handleEdit(c)}
                    disabled={loading}
                    className="bg-yellow-400 hover:bg-yellow-500 px-3 py-1 rounded text-sm disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c.customer_id, c.name)}
                    disabled={loading}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center p-8 text-gray-500">
                  No customers available. Add your first customer above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Customers;
