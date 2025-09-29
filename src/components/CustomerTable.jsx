import React, { useState } from "react";
import axios from "axios";

const CustomerTable = ({ customers, fetchCustomers }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "" });
  const [selectedImages, setSelectedImages] = useState({}); // per-customer image

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const handleEdit = (customer) => {
    setEditingId(customer.customer_id);
    setEditForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    });
  };

  const handleSave = async (id) => {
    try {
      await axios.put(`http://localhost:3000/customers/${id}`, editForm, {
        headers,
      });
      setEditingId(null);
      fetchCustomers();
    } catch (err) {
      console.error(err);
      alert("Failed to update customer");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?"))
      return;
    try {
      await axios.delete(`http://localhost:3000/customers/${id}`, { headers });
      fetchCustomers();
    } catch (err) {
      console.error(err);
      alert("Failed to delete customer");
    }
  };

  const handleUploadImage = async (id) => {
    const file = selectedImages[id];
    if (!file) {
      alert("Select an image first");
      return;
    }
    const formData = new FormData();
    formData.append("image", file);
    try {
      await axios.post(
        `http://localhost:3000/customers/${id}/upload-picture`,
        formData,
        {
          headers: {
            ...headers,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setSelectedImages((prev) => ({ ...prev, [id]: null }));
      fetchCustomers();
    } catch (err) {
      console.error(err);
      alert("Failed to upload image");
    }
  };

  return (
    <table className="w-full border-collapse border font-serif text-deep-purple">
      <thead>
        <tr className="bg-gray-200">
          <th className="border p-2">Picture</th>
          <th className="border p-2">Name</th>
          <th className="border p-2">Email</th>
          <th className="border p-2">Phone</th>
          <th className="border p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {customers.map((c) => (
          <tr key={c.customer_id} className="hover:bg-gray-100">
            <td className="border p-2">
              {c.profile_pic ? (
                <img
                  src={`http://localhost:3000${c.profile_pic}`}
                  alt={c.name}
                  width="50"
                  className="rounded"
                />
              ) : (
                <span className="text-gray-500">No image</span>
              )}
            </td>

            {/* Editable Fields */}
            <td className="border p-2">
              {editingId === c.customer_id ? (
                <input
                  className="border px-1 py-1 w-full"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                />
              ) : (
                c.name
              )}
            </td>
            <td className="border p-2">
              {editingId === c.customer_id ? (
                <input
                  className="border px-1 py-1 w-full"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                />
              ) : (
                c.email
              )}
            </td>
            <td className="border p-2">
              {editingId === c.customer_id ? (
                <input
                  className="border px-1 py-1 w-full"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                />
              ) : (
                c.phone
              )}
            </td>

            {/* Actions */}
            <td className="border p-2 flex flex-wrap gap-1 items-center">
              {editingId === c.customer_id ? (
                <button
                  className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                  onClick={() => handleSave(c.customer_id)}
                >
                  Save
                </button>
              ) : (
                <button
                  className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                  onClick={() => handleEdit(c)}
                >
                  Edit
                </button>
              )}
              <button
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                onClick={() => handleDelete(c.customer_id)}
              >
                Delete
              </button>
              <input
                type="file"
                className="border rounded px-1 py-1"
                onChange={(e) =>
                  setSelectedImages((prev) => ({
                    ...prev,
                    [c.customer_id]: e.target.files[0],
                  }))
                }
              />
              <button
                className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                onClick={() => handleUploadImage(c.customer_id)}
              >
                Upload
              </button>
            </td>
          </tr>
        ))}
        {customers.length === 0 && (
          <tr>
            <td colSpan="5" className="text-center py-4 text-gray-500">
              No customers found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default CustomerTable;
