import React, { useState } from "react";
import axios from "axios";

const InventoryTable = ({ products, refresh, headers }) => {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: "", price: "", stock: "" });

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await axios.delete(`http://localhost:3000/inventory/${productId}`, {
        headers,
      });
      refresh();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete product.");
    }
  };

  const handleEditClick = (product) => {
    setEditingId(product.product_id);
    setEditData({
      name: product.name,
      price: product.price,
      stock: product.stock,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({ name: "", price: "", stock: "" });
  };

  const handleSaveEdit = async (productId) => {
    try {
      await axios.put(
        `http://localhost:3000/inventory/${productId}`,
        editData,
        { headers }
      );
      setEditingId(null);
      refresh();
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update product.");
    }
  };

  return (
    <div className="overflow-x-auto font-serif text-deep-purple">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="border p-2">Image</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Stock</th>
            <th className="border p-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product.product_id}
              className="hover:bg-gray-50 text-center"
            >
              <td className="border p-2">
                {product.image_url ? (
                  <img
                    src={`http://localhost:3000${product.image_url}`}
                    alt={product.name}
                    className="w-16 h-16 object-cover mx-auto rounded"
                  />
                ) : (
                  <span className="text-gray-500">No Image</span>
                )}
              </td>

              {editingId === product.product_id ? (
                <>
                  <td className="border p-2">
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                      className="border p-1 rounded w-full"
                      required
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editData.price}
                      onChange={(e) =>
                        setEditData({ ...editData, price: e.target.value })
                      }
                      className="border p-1 rounded w-full"
                      required
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      min="0"
                      value={editData.stock}
                      onChange={(e) =>
                        setEditData({ ...editData, stock: e.target.value })
                      }
                      className="border p-1 rounded w-full"
                      required
                    />
                  </td>
                  <td className="border p-2 flex justify-center gap-2">
                    <button
                      onClick={() => handleSaveEdit(product.product_id)}
                      className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className="border p-2">{product.name}</td>
                  <td className="border p-2">
                    ${parseFloat(product.price).toFixed(2)}
                  </td>
                  <td className="border p-2">{product.stock}</td>
                  <td className="border p-2 flex justify-center gap-2">
                    <button
                      onClick={() => handleEditClick(product)}
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.product_id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan="5" className="border p-4 text-center text-gray-500">
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
