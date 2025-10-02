import React from "react";

const SalesTable = ({ sales }) => {
  if (!sales || sales.length === 0) {
    return (
      <div className="bg-yellow-50 text-yellow-800 p-4 rounded shadow text-center font-serif">
        No sales found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto font-serif text-deep-purple">
      <table className="min-w-full bg-white border border-gray-300 rounded shadow">
        <thead className="bg-purple-100">
          <tr>
            <th className="border px-4 py-2 text-left">Sale ID</th>
            <th className="border px-4 py-2 text-left">Customer</th>
            <th className="border px-4 py-2 text-left">Products</th>
            <th className="border px-4 py-2 text-left">Quantities</th>
            <th className="border px-4 py-2 text-left">Prices</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.sales_id} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{sale.sales_id}</td>
          

              <td className="border px-4 py-2">{sale.customer_name}</td>
              <td className="border px-4 py-2">
                {sale.items?.map((p) =>{ console.log(p); return p.product_name}).join(", ")}
              </td>
              <td className="border px-4 py-2">
                {sale.items?.map((p) => p.quantity).join(", ")}
              </td>
              <td className="border px-4 py-2">
                {sale.items
                  ?.map((p) => `$${parseFloat(p.price).toFixed(2)}`)
                  .join(", ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesTable;
