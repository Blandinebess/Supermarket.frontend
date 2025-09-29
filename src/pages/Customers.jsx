import { useEffect, useState } from "react";
import axios from "axios";
import { PlusCircle, Edit, Trash2, User, Upload } from "lucide-react";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const res = await axios.get("http://localhost:3000/customers", {
        headers,
      });
      setCustomers(res.data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Add or update customer
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:3000/customers/${editingId}`, form, {
          headers,
        });
      } else {
        await axios.post("http://localhost:3000/customers", form, { headers });
      }
      setForm({ name: "", email: "", phone: "" });
      setEditingId(null);
      setShowModal(false);
      fetchCustomers();
    } catch (err) {
      console.error("Error saving customer:", err);
    }
  };

  // Delete customer
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await axios.delete(`http://localhost:3000/customers/${id}`, {
          headers,
        });
        fetchCustomers();
      } catch (err) {
        console.error("Error deleting customer:", err);
      }
    }
  };

  // Open modal for add/edit
  const openModal = (c = null) => {
    if (c) {
      setForm({ name: c.name, email: c.email, phone: c.phone });
      setEditingId(c.customer_id);
    } else {
      setForm({ name: "", email: "", phone: "" });
      setEditingId(null);
    }
    setShowModal(true);
  };

  // Upload profile picture
  const handleUpload = async (file, customerId) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      await axios.post(
        `http://localhost:3000/customers/${customerId}/upload-picture`,
        formData,
        {
          headers: {
            ...headers,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      fetchCustomers();
    } catch (err) {
      console.error("Error uploading image:", err);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-teal-800 mb-6 flex items-center gap-2">
        <User className="w-8 h-8 text-teal-600" /> Customer Management
      </h1>

      <button
        onClick={() => openModal()}
        className="mb-4 flex items-center gap-2 bg-teal-700 text-white px-4 py-2 rounded-lg hover:bg-teal-800"
      >
        <PlusCircle className="w-5 h-5" /> Add Customer
      </button>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-md p-6 rounded-xl w-96 flex flex-col gap-3 relative"
          >
            <h2 className="text-2xl font-bold text-teal-800 mb-4">
              {editingId ? "Edit Customer" : "Add Customer"}
            </h2>
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border p-2 rounded-lg"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="border p-2 rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="border p-2 rounded-lg"
              required
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-teal-700 text-white hover:bg-teal-800"
              >
                {editingId ? "Update" : "Add"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Customers Table */}
      <table className="w-full bg-white shadow-md rounded-xl overflow-hidden">
        <thead className="bg-teal-700 text-white">
          <tr>
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Phone</th>
            <th className="px-4 py-2 text-left">Profile Picture</th>
            <th className="px-4 py-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.customer_id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2">{c.customer_id}</td>
              <td className="px-4 py-2">{c.name}</td>
              <td className="px-4 py-2">{c.email}</td>
              <td className="px-4 py-2">{c.phone}</td>
              <td className="px-4 py-2">
                {c.profile_pic ? (
                  <img
                    src={`http://localhost:3000/${c.profile_pic}`}
                    alt={c.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-2 flex justify-center gap-2">
                <button
                  onClick={() => openModal(c)}
                  className="bg-yellow-400 px-3 py-1 rounded-lg text-white hover:bg-yellow-500"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(c.customer_id)}
                  className="bg-red-500 px-3 py-1 rounded-lg text-white hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <label className="bg-teal-600 px-3 py-1 rounded-lg text-white hover:bg-teal-700 cursor-pointer flex items-center gap-1">
                  <Upload className="w-4 h-4" /> Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleUpload(e.target.files[0], c.customer_id)
                    }
                  />
                </label>
              </td>
            </tr>
          ))}
          {customers.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center py-4 text-gray-500">
                No customers found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
