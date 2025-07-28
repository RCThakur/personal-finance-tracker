import { useState, useEffect } from "react";
import { useTransactions } from "../context/TransactionContext";

const defaultForm = {
  description: "",
  amount: "",
  type: "income",
  category: "",
  date: new Date().toISOString().split("T")[0],
};

const TransactionForm = ({ editItem = null, onDone = () => {} }) => {
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState("");
  const { addTransaction, updateTransaction } = useTransactions();

  // If editing, load values into form
  useEffect(() => {
    if (editItem) {
      setForm({
        description: editItem.description,
        amount: editItem.amount,
        type: editItem.type,
        category: editItem.category,
        date: editItem.date,
      });
    }
  }, [editItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.description.trim()) {
      return setError("Description is required.");
    }
    if (!form.amount || Number(form.amount) <= 0) {
      return setError("Amount must be a positive number.");
    }

    const transaction = {
      ...form,
      amount: parseFloat(form.amount),
      date: form.date,
    };

    try {
      if (editItem) {
        await updateTransaction(editItem.id, transaction);
      } else {
        await addTransaction(transaction);
      }
      setForm(defaultForm);
      onDone(); // Notify parent to exit edit mode
    } catch (err) {
      setError("Failed to save transaction. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-black shadow p-4 rounded space-y-4">
      <h2 className="text-xl font-semibold">{editItem ? "Edit" : "Add"} Transaction</h2>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex flex-col">
        <label className="font-medium color-black ">Description</label>
        <input
          type="text"
          name="description"
          className="input input-bordered"
          value={form.description}
          onChange={handleChange}
          placeholder="e.g., Salary, Rent"
        />
      </div>

      <div className="flex flex-col">
        <label className="font-medium">Amount</label>
        <input
          type="number"
          name="amount"
          className="input input-bordered"
          value={form.amount}
          onChange={handleChange}
        />
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="type"
            value="income"
            checked={form.type === "income"}
            onChange={handleChange}
          />
          Income
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="type"
            value="expense"
            checked={form.type === "expense"}
            onChange={handleChange}
          />
          Expense
        </label>
      </div>

      <div className="flex flex-col">
        <label className="font-medium">Category</label>
        <input
          type="text"
          name="category"
          className="input input-bordered"
          value={form.category}
          onChange={handleChange}
          placeholder="e.g., Food, Rent, Freelance"
        />
      </div>

      <div className="flex flex-col">
        <label className="font-medium">Date</label>
        <input
          type="date"
          name="date"
          className="input input-bordered"
          value={form.date}
          onChange={handleChange}
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
      >
        {editItem ? "Update" : "Add"} Transaction
      </button>
    </form>
  );
};

export default TransactionForm;
