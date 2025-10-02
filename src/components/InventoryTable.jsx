import React, { useState } from "react";
import API from "../utils/api";

const InventoryTable = ({ products, refresh }) => {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);

  // ✅ Delete product
  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await API.delete(`/inventory/${productId}`);
      refresh();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete product.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Start editing
  const handleEditClick = (product) => {
    setEditingId(product.product_id);
    setEditData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category || "",
    });
  };

  // ✅ Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({ name: "", price: "", stock: "", category: "" });
  };

  // ✅ Save edited product
  const handleSaveEdit = async (productId) => {
    try {
      setLoading(true);
      await API.put(`/inventory/${productId}`, editData);
      setEditingId(null);
      refresh();
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update product.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Upload picture
  const handleUpload = async (productId, e) => {
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
      alert("Please upload a valid image file (JPG, PNG, GIF, WebP)");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setUploadingId(productId);

    try {
      await API.post(`/inventory/${productId}/upload-picture`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      refresh();
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload picture");
    } finally {
      setUploadingId(null);
      e.target.value = "";
    }
  };

  return (
    <div className="bg-white shadow rounded overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-3 border-b">Image</th>
            <th className="p-3 border-b">Name</th>
            <th className="p-3 border-b">Price</th>
            <th className="p-3 border-b">Stock</th>
            <th className="p-3 border-b">Category</th>
            <th className="p-3 border-b text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.product_id} className="border-b hover:bg-gray-50">
              {/* Image Column */}
              <td className="p-3">
                <div className="flex flex-col items-center space-y-2">
                  {product.image_url ? (
                    <img
                      src={`http://localhost:3000/${product.image_url}`}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded border"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded border flex items-center justify-center">
                      <span className="text-gray-500 text-xs">No image</span>
                    </div>
                  )}

                  {/* Upload Button */}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUpload(product.product_id, e)}
                      className="hidden"
                      disabled={uploadingId === product.product_id || loading}
                    />
                    <span
                      className={`text-xs px-2 py-1 rounded text-white ${
                        uploadingId === product.product_id || loading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-600"
                      }`}
                    >
                      {uploadingId === product.product_id
                        ? "Uploading..."
                        : "Upload"}
                    </span>
                  </label>
                </div>
              </td>

              {/* Editable Fields */}
              {editingId === product.product_id ? (
                <>
                  <td className="p-3">
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={loading}
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editData.price}
                      onChange={(e) =>
                        setEditData({ ...editData, price: e.target.value })
                      }
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={loading}
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      min="0"
                      value={editData.stock}
                      onChange={(e) =>
                        setEditData({ ...editData, stock: e.target.value })
                      }
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={loading}
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      value={editData.category}
                      onChange={(e) =>
                        setEditData({ ...editData, category: e.target.value })
                      }
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Category"
                      disabled={loading}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleSaveEdit(product.product_id)}
                        disabled={loading}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                      >
                        {loading ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={loading}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td className="p-3 font-medium">{product.name}</td>
                  <td className="p-3">
                    ${parseFloat(product.price).toFixed(2)}
                  </td>
                  <td className="p-3">
                    <span
                      className={
                        product.stock < 10 ? "text-red-600 font-bold" : ""
                      }
                    >
                      {product.stock}
                      {product.stock < 10 && " (Low)"}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                      {product.category || "No Category"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleEditClick(product)}
                        disabled={loading}
                        className="bg-yellow-400 hover:bg-yellow-500 px-3 py-1 rounded text-sm disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(product.product_id, product.name)
                        }
                        disabled={loading}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan="6" className="p-8 text-center text-gray-500">
                No products found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
