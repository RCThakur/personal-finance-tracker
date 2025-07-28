import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

const AddTransaction = () => {
  const [form, setForm] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    type: "income",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
      return setError("Amount must be a positive number.");
    }

    if (!form.description.trim()) {
      return setError("Description is required.");
    }

    try {
      await addDoc(collection(db, "transactions"), {
        amount: Number(form.amount),
        description: form.description,
        date: form.date,
        type: form.type,
      });

      setMessage("✅ Transaction added successfully!");
      setForm({ amount: "", description: "", date: new Date().toISOString().split("T")[0], type: "income" });
    } catch (err) {
      console.error("Firestore Error:", err);
      setError("Failed to add transaction. Please try again.");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-black-100">
      <h1 className="text-3xl font-bold mb-4">➕ Add New Transaction</h1>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 max-w-md bg-black p-6 rounded shadow"
      >
        {error && <p className="text-red-600">{error}</p>}
        {message && <p className="text-green-600">{message}</p>}

        <div className="flex flex-col">
          <label htmlFor="amount" className="mb-1 font-medium">
            Amount (₹)
          </label>
          <input
            type="number"
            name="amount"
            id="amount"
            placeholder="Enter amount"
            value={form.amount}
            onChange={handleChange}
            required
            className="p-2 border rounded"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="description" className="mb-1 font-medium">
            Description
          </label>
          <input
            type="text"
            name="description"
            id="description"
            placeholder="e.g. Rent, Salary"
            value={form.description}
            onChange={handleChange}
            required
            className="p-2 border rounded"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="date" className="mb-1 font-medium">
            Date
          </label>
          <input
            type="date"
            name="date"
            id="date"
            value={form.date}
            onChange={handleChange}
            required
            className="p-2 border rounded"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="type" className="mb-1 font-medium">
            Transaction Type
          </label>
          <select
            name="type"
            id="type"
            value={form.type}
            onChange={handleChange}
            className="p-2 border rounded"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Add Transaction
        </button>
      </form>
    </div>
  );
};

export default AddTransaction;
