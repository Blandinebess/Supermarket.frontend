import React, { useEffect, useState } from "react";
import API from "../utils/api";
import EditProductModal from "../components/EditProductModal";

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", stock: "" });
  const [error, setError] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await API.get("/inventory");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch products");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/inventory", form);
      setForm({ name: "", price: "", stock: "" });
      fetchProducts();
    } catch (err) {
      console.error(err);
      setError("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleUpdateProduct = async (productId, updatedData) => {
    await API.put(`/inventory/${productId}`, updatedData);
    fetchProducts();
  };

  const handleCloseModal = () => {
    setEditingProduct(null);
  };

  const handleDelete = async (id, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      return;
    }

    try {
      await API.delete(`/inventory/${id}`);
      fetchProducts();
    } catch (err) {
      console.error(err);
      setError("Failed to delete product");
    }
  };

  const handleUpload = async (id, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPG, PNG, GIF)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setLoading(true);
      await API.post(`/inventory/${id}/upload-picture`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchProducts();
      setError("");
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.response?.data?.message || "Failed to upload picture");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📦 Inventory</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow p-4 rounded mb-6"
      >
        <div className="grid grid-cols-3 gap-3">
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleChange}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          />
          <input
            type="number"
            step="0.01"
            name="price"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          />
          <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={form.stock}
            onChange={handleChange}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Product"}
        </button>
      </form>

      <div className="bg-white shadow rounded overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">Image</th>
              <th className="p-3">Name</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.product_id} className="border-t hover:bg-gray-50">
                <td className="p-3">
            
                  <div className="flex flex-col items-center">
                    {p.picture_url ? (
                      <img
                        src={`http://localhost:3000${p.picture_url}`}
                        alt={p.name}
                        className="w-16 h-16 object-cover rounded border mb-2"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded border flex items-center justify-center mb-2">
                        <span className="text-gray-500 text-xs">No image</span>
                      </div>
                    )}
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUpload(p.product_id, e)}
                        className="hidden"
                        disabled={loading}
                      />
                      <span className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded">
                        {loading ? "Uploading..." : "Upload"}
                      </span>
                    </label>
                  </div>
                </td>
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3">${parseFloat(p.price).toFixed(2)}</td>
                <td className="p-3">
                  <span
                    className={p.stock < 10 ? "text-red-600 font-bold" : ""}
                  >
                    {p.stock}
                    {p.stock < 10 && " (Low Stock)"}
                  </span>
                </td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => handleEdit(p)}
                    disabled={loading}
                    className="bg-yellow-400 hover:bg-yellow-500 px-3 py-1 rounded text-sm disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.product_id, p.name)}
                    disabled={loading}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center p-8 text-gray-500">
                  No products available. Add your first product above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <EditProductModal
        product={editingProduct}
        onUpdate={handleUpdateProduct}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Inventory;
