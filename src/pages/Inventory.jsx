import React, { useState, useEffect } from "react";
import axios from "axios";
import SalesTable from "../components/SalesTable";

const Sales = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [cart, setCart] = useState([]);
  const [sales, setSales] = useState([]);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, prodRes, salesRes] = await Promise.all([
          axios.get("http://localhost:3000/customers", { headers }),
          axios.get("http://localhost:3000/inventory", { headers }),
          axios.get("http://localhost:3000/sales", { headers }),
        ]);

        setCustomers(custRes.data);
        setProducts(prodRes.data);
        setSales(salesRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const addToCart = (product) => {
    const exists = cart.find((i) => i.product_id === product.product_id);
    if (exists) {
      setCart(
        cart.map((i) =>
          i.product_id === product.product_id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, qty) => {
    setCart(
      cart.map((i) => (i.product_id === id ? { ...i, quantity: +qty } : i))
    );
  };

  const totalAmount = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleSubmitSale = async () => {
    if (!selectedCustomer || cart.length === 0) {
      alert("Select customer and products");
      return;
    }

    try {
      // 1. Create sale
      const saleRes = await axios.post(
        "http://localhost:3000/sales",
        { customer_id: selectedCustomer, total_amount: totalAmount },
        { headers }
      );

      const saleId = saleRes.data.sales_id;

      // 2. Add items
      await Promise.all(
        cart.map((item) =>
          axios.post(
            `http://localhost:3000/sales/${saleId}/items`,
            {
              product_id: item.product_id,
              quantity: item.quantity,
              price: item.price,
            },
            { headers }
          )
        )
      );

      alert("Sale recorded!");
      setCart([]);
      setSelectedCustomer("");

      // Refresh sales table
      const updatedSales = await axios.get("http://localhost:3000/sales", {
        headers,
      });
      setSales(updatedSales.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Sales Management</h1>

      {/* Customer */}
      <div className="mb-4">
        <label className="font-semibold">Customer:</label>
        <select
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(e.target.value)}
          className="border p-2 rounded ml-2"
        >
          <option value="">-- Select --</option>
          {customers.map((c) => (
            <option key={c.customer_id} value={c.customer_id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products */}
      <div className="mb-6">
        <h2 className="font-bold mb-2">Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <div
              key={p.product_id}
              className="border p-2 rounded cursor-pointer hover:bg-gray-100"
              onClick={() => addToCart(p)}
            >
              <p>{p.name}</p>
              <p>${p.price}</p>
              <p>Stock: {p.stock}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="mb-6">
        <h2 className="font-bold mb-2">Cart</h2>
        <table className="table-auto w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item) => (
              <tr key={item.product_id}>
                <td>{item.name}</td>
                <td>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.product_id, e.target.value)
                    }
                    className="border p-1 w-16"
                  />
                </td>
                <td>${item.price}</td>
                <td>${item.price * item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-lg font-bold mt-2">Total: ${totalAmount}</p>
        <button
          onClick={handleSubmitSale}
          className="bg-blue-500 text-white px-4 py-2 mt-2 rounded"
        >
          Submit Sale
        </button>
      </div>

      {/* Sales Table */}
      <SalesTable sales={sales} />
    </div>
  );
};

export default Sales;
