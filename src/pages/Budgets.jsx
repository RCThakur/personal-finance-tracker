// src/pages/Budgets.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const CATEGORIES = [
  { id: "food", name: "Food 🍎", color: "#10B981" },
  { id: "transport", name: "Transport 🚗", color: "#3B82F6" },
  { id: "bills", name: "Bills ⚡", color: "#F59E0B" },
  { id: "entertainment", name: "Entertainment 🎮", color: "#EC4899" },
  { id: "salary", name: "Salary 💼", color: "#10B981" },
  { id: "other", name: "Other ➕", color: "#6B7280" },
];

const Budgets = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    category: "food",
    amount: "",
    name: "",
  });
  const [loading, setLoading] = useState(true);

  // Load budgets and transactions
  useEffect(() => {
    if (!user?.uid) {
      setBudgets([]);
      setTransactions([]);
      setLoading(false);
      return;
    }

    // Listen to budgets
    const budgetsQuery = query(
      collection(db, "budgets"),
      where("userId", "==", user.uid)
    );
    const budgetsUnsub = onSnapshot(budgetsQuery, (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBudgets(data);
    });

    // Listen to transactions (for spending calculation)
    const transactionsQuery = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const transactionsUnsub = onSnapshot(transactionsQuery, (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(data);
      setLoading(false);
    });

    return () => {
      budgetsUnsub();
      transactionsUnsub();
    };
  }, [user?.uid]);

  // Calculate spent amount for each budget
  const getSpentAmount = (categoryId) => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return transactions
      .filter(
        (t) =>
          t.category === categoryId &&
          t.type === "expense" &&
          new Date(t.createdAt?.toDate()) >= monthStart
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const addOrUpdateBudget = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.category) return;

    try {
      const budgetData = {
        userId: user.uid,
        category: formData.category,
        amount: parseFloat(formData.amount),
        name:
          formData.name ||
          CATEGORIES.find((c) => c.id === formData.category)?.name ||
          "Budget",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (editingBudget) {
        // Update existing budget
        await updateDoc(doc(db, "budgets", editingBudget.id), budgetData);
        setEditingBudget(null);
      } else {
        // Add new budget
        await addDoc(collection(db, "budgets"), budgetData);
      }

      // Reset form
      setFormData({ category: "food", amount: "", name: "" });
      setShowForm(false);
    } catch (error) {
      console.error("Error saving budget:", error);
    }
  };

  const deleteBudget = async (budgetId) => {
    if (!confirm("Delete this budget?")) return;
    try {
      await deleteDoc(doc(db, "budgets", budgetId));
    } catch (error) {
      console.error("Error deleting budget:", error);
    }
  };

  const startEditBudget = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.amount.toString(),
      name: budget.name,
    });
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-white/20 border-t-emerald-400 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* 🎯 HEADER */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-emerald-500/10 border border-white/20 rounded-3xl p-8 backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent mb-2">
                Budgets Dashboard
              </h1>
              <p className="text-xl text-white/70">
                Control your spending •{" "}
                <span className="text-emerald-400 font-semibold">
                  {budgets.length} active budgets
                </span>
              </p>
            </div>
            <button
              onClick={() => {
                setEditingBudget(null);
                setFormData({ category: "food", amount: "", name: "" });
                setShowForm(true);
              }}
              className="px-8 py-4 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 text-slate-900 text-lg font-black rounded-3xl shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-400/70 hover:scale-105 transition-all duration-300 transform"
            >
              ➕ New Budget
            </button>
          </div>
        </div>

        {/* 📊 BUDGETS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.length === 0 ? (
            <div className="col-span-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-16 text-center">
              <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-emerald-400/20 to-indigo-400/20 rounded-3xl flex items-center justify-center shadow-2xl">
                <span className="text-4xl">💳</span>
              </div>
              <h3 className="text-2xl font-black mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                No budgets yet
              </h3>
              <p className="text-xl text-white/60 mb-8 max-w-md mx-auto">
                Create your first budget to start tracking your spending limits!
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-10 py-4 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 text-slate-900 text-xl font-black rounded-3xl shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-400/70 hover:scale-105 transition-all duration-300 transform"
              >
                ➕ Create First Budget
              </button>
            </div>
          ) : (
            budgets.map((budget) => {
              const category = CATEGORIES.find((c) => c.id === budget.category);
              const spent = getSpentAmount(budget.category);
              const remaining = budget.amount - spent;
              const progress = (spent / budget.amount) * 100;

              return (
                <div
                  key={budget.id}
                  className="group bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-400/30 rounded-3xl p-8 backdrop-blur-xl hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
                >
                  {/* Progress Ring Background */}
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      background: `conic-gradient(${
                        category?.color || "#10B981"
                      } ${progress}%, transparent 0%)`,
                    }}
                  />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl"
                          style={{
                            backgroundColor: `${
                              category?.color || "#10B981"
                            }20`,
                          }}
                        >
                          <span
                            className="text-2xl font-bold"
                            style={{ color: category?.color || "#10B981" }}
                          >
                            {budget.name.split(" ")[0][0] || "B"}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-white">
                            {budget.name}
                          </h3>
                          <p className="text-white/60 text-sm">Monthly limit</p>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                          onClick={() => startEditBudget(budget)}
                          className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all duration-200"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteBudget(budget.id)}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-red-300 hover:text-red-200 transition-all duration-200"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-3xl lg:text-4xl font-black text-emerald-400 mb-1">
                          ₹{spent.toLocaleString("en-IN")}
                        </p>
                        <p className="text-2xl font-bold text-white/80">
                          / ₹{budget.amount.toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-yellow-400 rounded-full transition-all duration-1000 relative"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-300 font-semibold">
                          {progress.toFixed(0)}% used
                        </span>
                        <span
                          className={`
                          font-bold ${
                            remaining >= 0
                              ? "text-emerald-400"
                              : "text-red-400 animate-pulse"
                          }
                        `}
                        >
                          {remaining >= 0 ? "+" : ""}₹
                          {Math.abs(remaining).toLocaleString("en-IN")}{" "}
                          {remaining >= 0 ? "left" : "over"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 📈 OVERVIEW */}
        {budgets.length > 0 && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <h3 className="text-2xl font-black bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-6">
              Budget Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-4xl font-black text-emerald-400">
                  {
                    budgets.filter((b) => getSpentAmount(b.category) < b.amount)
                      .length
                  }
                </p>
                <p className="text-white/70 mt-2">On Track</p>
              </div>
              <div>
                <p className="text-4xl font-black text-yellow-400">
                  {
                    budgets.filter(
                      (b) =>
                        getSpentAmount(b.category) >= b.amount * 0.8 &&
                        getSpentAmount(b.category) < b.amount
                    ).length
                  }
                </p>
                <p className="text-white/70 mt-2">⚠️ Warning</p>
              </div>
              <div>
                <p className="text-4xl font-black text-red-400">
                  {
                    budgets.filter(
                      (b) => getSpentAmount(b.category) >= b.amount
                    ).length
                  }
                </p>
                <p className="text-white/70 mt-2">❌ Over Budget</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✨ BUDGET MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-3xl border border-white/20 rounded-4xl w-full max-w-2xl p-10 max-h-[90vh] overflow-y-auto shadow-3xl shadow-emerald-500/25">
            <div className="text-center mb-10">
              <h3 className="text-4xl font-black bg-gradient-to-r from-emerald-400 via-white to-emerald-400 bg-clip-text text-transparent mb-3">
                {editingBudget ? "Edit Budget" : "New Budget"}
              </h3>
              <p className="text-xl text-white/80">
                Set your monthly spending limit
              </p>
            </div>

            <form onSubmit={addOrUpdateBudget} className="space-y-8">
              <div>
                <label className="block text-white/80 font-semibold mb-3 text-lg">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full rounded-3xl bg-white/20 border-2 border-white/30 px-8 py-6 text-xl focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/30 transition-all duration-300 hover:border-white/50 appearance-none"
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/80 font-semibold mb-3 text-lg">
                  Monthly Limit
                </label>
                <input
                  type="number"
                  placeholder="5000"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full rounded-3xl bg-white/20 border-2 border-white/30 px-8 py-6 text-2xl placeholder-white/50 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/30 transition-all duration-300 hover:border-white/50 font-mono tracking-wider"
                  required
                  step="100"
                />
              </div>

              <div>
                <label className="block text-white/80 font-semibold mb-3 text-lg">
                  Custom Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Groceries, Transport, etc."
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-3xl bg-white/20 border-2 border-white/30 px-8 py-6 text-xl placeholder-white/50 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/30 transition-all duration-300 hover:border-white/50"
                />
              </div>

              <div className="flex gap-6 pt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingBudget(null);
                    setFormData({ category: "food", amount: "", name: "" });
                  }}
                  className="flex-1 h-16 rounded-3xl border-2 border-white/30 py-4 text-xl font-black bg-white/5 backdrop-blur-xl hover:bg-white/15 hover:border-white/50 transition-all duration-300 hover:scale-[1.02] shadow-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-16 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 text-slate-900 text-xl font-black rounded-3xl shadow-3xl shadow-emerald-500/50 hover:shadow-emerald-400/70 hover:scale-[1.02] transition-all duration-300 transform"
                >
                  💾 {editingBudget ? "Update Budget" : "Create Budget"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Budgets;
