import { useState } from "react";

export default function AddProductForm({ onAdd }) {
  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ name, stock: Number(stock), price: Number(price) });
    setName("");
    setStock("");
    setPrice("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded shadow font-elegant"
    >
      <h2 className="text-2xl text-royal font-bold mb-4">Add Product</h2>
      <input
        className="border p-2 w-full mb-3"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="border p-2 w-full mb-3"
        placeholder="Stock"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
      />
      <input
        className="border p-2 w-full mb-3"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <button className="bg-royal text-white py-2 px-4 rounded hover:bg-gold hover:text-royal transition">
        Add
      </button>
    </form>
  );
}
