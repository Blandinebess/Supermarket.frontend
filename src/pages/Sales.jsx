// src/pages/Sales.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import SalesTable from "../components/SalesTable"; // adjust path if needed

const API = "http://localhost:3000";

const Sales = () => {
  const [customers, setCustomers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [sales, setSales] = useState([]);
  const [connectionError, setConnectionError] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const handleNetworkError = (err) => {
    if (err.message === "Network Error") {
      setConnectionError("Cannot connect to backend at http://localhost:3000");
    } else if (err.response && err.response.data) {
      if (err.response.status === 401 || err.response.status === 403) {
        setConnectionError("Unauthorized — please login again.");
        // optionally clear token and redirect to login
      }
    }
    console.error(err);
  };

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/customers`, { headers: authHeaders });
      setCustomers(res.data || []);
      setConnectionError(null);
    } catch (err) {
      handleNetworkError(err);
    }
  }, [token]);

  const fetchInventory = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/inventory`, { headers: authHeaders });
      setInventory(res.data || []);
      setConnectionError(null);
    } catch (err) {
      handleNetworkError(err);
    }
  }, [token]);

  const fetchSales = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/sales`, { headers: authHeaders });
      setSales(res.data || []);
      setConnectionError(null);
    } catch (err) {
      handleNetworkError(err);
    }
  }, [token]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchCustomers(), fetchInventory(), fetchSales()]);
      setLoading(false);
    };
    load();
  }, [fetchCustomers, fetchInventory, fetchSales]);

  const addItem = () => {
    setItems((s) => [...s, { product_id: "", quantity: 1, price: 0 }]);
  };

  const updateItem = (index, field, value) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };

      // if product chosen, set price from inventory
      if (field === "product_id") {
        const p = inventory.find(
          (it) => String(it.product_id) === String(value)
        );
        next[index].price = p ? Number(p.price) : 0;
      }
      // recalc total
      const sum = next.reduce(
        (acc, it) => acc + (Number(it.price) || 0) * (Number(it.quantity) || 0),
        0
      );
      setTotal(sum);
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) return alert("Select a customer");
    if (items.length === 0) return alert("Add at least one product");

    try {
      const saleRes = await axios.post(
        `${API}/sales`,
        { customer_id: selectedCustomer, total_amount: total },
        { headers: authHeaders }
      );
      const sale_id = saleRes.data.sales_id;

      for (const it of items) {
        const product = inventory.find(
          (p) => String(p.product_id) === String(it.product_id)
        );
        if (!product) {
          alert("Product not found: " + it.product_id);
          continue;
        }
        if (it.quantity > product.stock) {
          alert(
            `Not enough stock for ${product.name}. Available: ${product.stock}`
          );
          continue;
        }
        await axios.post(
          `${API}/sales/${sale_id}/items`,
          { product_id: it.product_id, quantity: it.quantity },
          { headers: authHeaders }
        );
      }

      alert("Sale recorded");
      setSelectedCustomer("");
      setItems([]);
      setTotal(0);
      fetchSales();
      fetchInventory();
    } catch (err) {
      console.error(err);
      alert("Failed to record sale");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Record Sale</h1>

      {connectionError && (
        <div className="bg-red-100 p-3 rounded mb-4 text-red-800">
          {connectionError}
        </div>
      )}

      {loading && <div className="mb-4">Loading...</div>}

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label>Customer</label>
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="border p-2 w-full"
          >
            <option value="">Select customer</option>
            {customers.map((c) => (
              <option key={c.customer_id} value={c.customer_id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          {items.map((it, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <select
                value={it.product_id}
                onChange={(e) => updateItem(idx, "product_id", e.target.value)}
                className="border p-2 flex-1"
              >
                <option value="">Select product</option>
                {inventory.map((p) => (
                  <option key={p.product_id} value={p.product_id}>
                    {p.name} (Stock: {p.stock})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={it.quantity}
                onChange={(e) =>
                  updateItem(idx, "quantity", Number(e.target.value))
                }
                className="border p-2 w-24"
              />
              <div className="p-2 w-24">${Number(it.price).toFixed(2)}</div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addItem}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Add Product
        </button>
        <div className="mt-4 font-bold">Total: ${Number(total).toFixed(2)}</div>
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded mt-2"
        >
          Submit Sale
        </button>
      </form>

      <h2 className="text-xl font-bold mb-2">Past Sales</h2>
      <SalesTable sales={sales || []} />
    </div>
  );
};

export default Sales;
