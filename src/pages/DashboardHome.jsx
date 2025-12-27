// src/pages/DashboardHome.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

const CATEGORIES = [
  { id: "food", name: "Food 🍎", color: "#10B981" },
  { id: "transport", name: "Transport 🚗", color: "#3B82F6" },
  { id: "bills", name: "Bills ⚡", color: "#F59E0B" },
  { id: "entertainment", name: "Entertainment 🎮", color: "#EC4899" },
  { id: "salary", name: "Salary 💼", color: "#10B981" },
  { id: "other", name: "Other ➕", color: "#6B7280" },
];

const DashboardHome = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showQuickStats, setShowQuickStats] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "other",
    type: "expense",
  });
  const displayName =
    user?.displayName || user?.email?.split("@")[0] || "Friend";

  // Load transactions
  useEffect(() => {
    if (!user?.uid) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    console.log("🔍 Listening for user:", user.uid);

    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        console.log("📊 Snapshot:", snap.docs.length, "docs");
        const data = snap.docs.map((doc) => {
          const transactionData = doc.data();
          console.log("📄 Doc:", doc.id, transactionData);
          return {
            id: doc.id,
            ...transactionData,
          };
        });
        setTransactions(data);
        setLoading(false);
      },
      (error) => {
        console.error("❌ Snapshot error:", error);
      }
    );

    return () => {
      console.log("🧹 Unsubscribing");
      unsub();
    };
  }, [user?.uid]);

  const addTransaction = async (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    try {
      await addDoc(collection(db, "transactions"), {
        ...formData,
        userId: user.uid,
        amount: parseFloat(formData.amount),
        createdAt: new Date(),
      });
      setFormData({
        description: "",
        amount: "",
        category: "other",
        type: "expense",
      });
      setShowForm(false);
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const deleteTransaction = async (id) => {
    if (!confirm("Delete this transaction?")) return;
    try {
      await deleteDoc(doc(db, "transactions", id));
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  // Calculate stats
  const totalBalance = transactions.reduce(
    (sum, t) => sum + (t.type === "income" ? t.amount : -t.amount),
    0
  );
  const totalIncome = transactions.reduce(
    (sum, t) => (t.type === "income" ? sum + t.amount : sum),
    0
  );
  const totalExpense = transactions.reduce(
    (sum, t) => (t.type === "expense" ? sum + t.amount : sum),
    0
  );

  const savingsRate =
    totalIncome > 0
      ? (((totalIncome - totalExpense) / totalIncome) * 100).toFixed(1)
      : 0;

  // Pie chart data
  const categoryData = CATEGORIES.map((cat) => {
    const amount = transactions
      .filter((t) => t.category === cat.id && t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return { name: cat.name, value: amount, color: cat.color };
  }).filter((d) => d.value > 0);

  // Sample data for trend chart
  const trendData = [
    { month: "Dec", income: 35000, expense: 23120 },
    { month: "Nov", income: 32000, expense: 24500 },
    { month: "Oct", income: 34000, expense: 19800 },
  ];

  return (
    <>
      <div className="space-y-8 p-2 max-w-8xl mx-auto">
        {/* 🎯 HERO SECTION */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-emerald-500/10 border border-white/20 rounded-3xl p-8 backdrop-blur-xl">
          <div className="flex flex-row lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent mb-3">
                Welcome back,
              </h1>
              <p className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-400 via-white to-emerald-300 bg-clip-text text-transparent">
                {displayName} ✨
              </p>
              <p className="text-lg text-white/70 mt-2 max-w-md">
                Your finances are looking{" "}
                {savingsRate > 20
                  ? "excellent"
                  : savingsRate > 10
                  ? "great"
                  : "good"}
                !
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowForm(true)}
                className="px-8 py-4 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 text-slate-900 text-lg font-black rounded-3xl shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-400/70 hover:scale-105 transition-all duration-300 transform"
              >
                ➕ Add Transaction
              </button>
              <button
                onClick={() => setShowQuickStats(!showQuickStats)}
                className="px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/30 text-white text-lg font-semibold rounded-3xl hover:bg-white/20 hover:shadow-xl transition-all duration-300"
              >
                📊
                {showQuickStats ? " Hide" : " Quick Stats"}
              </button>
            </div>
          </div>
        </div>

        {/* 📊 QUICK STATS - NOW WORKS! */}
        {showQuickStats && (
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-3xl p-8 backdrop-blur-xl animate-in slide-in-from-top-4 duration-300">
            <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
              📈 Quick Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-2xl bg-white/10">
                <p className="text-3xl font-black text-purple-300">
                  ₹{totalBalance.toLocaleString("en-IN")}
                </p>
                <p className="text-purple-200 mt-2">Current Balance</p>
              </div>
              <div className="text-center p-6 rounded-2xl bg-white/10">
                <p className="text-3xl font-black text-emerald-300">
                  {savingsRate}%
                </p>
                <p className="text-emerald-200 mt-2">Savings Rate</p>
              </div>
              <div className="text-center p-6 rounded-2xl bg-white/10">
                <p className="text-3xl font-black text-blue-300">
                  {transactions.length}
                </p>
                <p className="text-blue-200 mt-2">Total Transactions</p>
              </div>
            </div>
          </div>
        )}

        {/* 💰 MAIN STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-400/30 rounded-3xl p-8 backdrop-blur-xl hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-500 hover:-translate-y-2">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-400/30 rounded-2xl flex items-center justify-center">
                <span className="text-emerald-500 text-xl">💰</span>
              </div>
              <span className="text-emerald-300 text-sm font-semibold px-3 py-1 bg-emerald-400/20 rounded-full">
                Live
              </span>
            </div>
            <p className="text-white/60 text-sm uppercase tracking-wide mb-2">
              Total Balance
            </p>
            <p className="text-4xl font-black text-emerald-400 group-hover:text-emerald-300 transition-colors">
              ₹{totalBalance.toLocaleString("en-IN")}
            </p>
            <p className="text-emerald-300 text-lg font-semibold mt-1">
              +{savingsRate}% savings rate
            </p>
          </div>

          <div className="group bg-gradient-to-br from-blue-500/10 to-indigo-600/10 border border-blue-400/30 rounded-3xl p-8 backdrop-blur-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 hover:-translate-y-2">
            <p className="text-white/60 text-sm uppercase tracking-wide mb-4">
              Total Income
            </p>
            <p className="text-4xl font-black text-blue-400 group-hover:text-blue-300">
              ₹{totalIncome.toLocaleString("en-IN")}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300 text-sm">Growing</span>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-red-500/10 to-rose-600/10 border border-red-400/30 rounded-3xl p-8 backdrop-blur-xl hover:shadow-2xl hover:shadow-red-500/25 transition-all duration-500 hover:-translate-y-2">
            <p className="text-white/60 text-sm uppercase tracking-wide mb-4">
              Total Expenses
            </p>
            <p className="text-4xl font-black text-red-400 group-hover:text-red-300">
              ₹{totalExpense.toLocaleString("en-IN")}
            </p>
            <div className="mt-3">
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-red-400 to-rose-500 h-2 rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.min(
                      (totalExpense / totalIncome || 0) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-purple-500/10 to-violet-600/10 border border-purple-400/30 rounded-3xl p-8 backdrop-blur-xl hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 hover:-translate-y-2">
            <p className="text-white/60 text-sm uppercase tracking-wide mb-4">
              Transactions
            </p>
            <p className="text-4xl font-black text-purple-400 group-hover:text-purple-300">
              {transactions.length}
            </p>
            <p className="text-purple-300 text-sm mt-2 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Real-time
            </p>
          </div>
        </div>

        {/* 📊 CHARTS SECTION */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* PIE CHART */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 xl:p-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                Spending Breakdown
              </h2>
              <div className="flex items-center gap-2 text-sm bg-emerald-400/20 text-emerald-300 px-4 py-2 rounded-2xl font-semibold">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                Live Data
              </div>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  dataKey="value"
                  nameKey="name"
                  cornerRadius={8}
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="white"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* BAR CHART */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 xl:p-10">
            <h2 className="text-2xl font-black bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-8">
              Monthly Trends
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={trendData}>
                <XAxis dataKey="month" stroke="white" fontSize={14} />
                <YAxis stroke="white" fontSize={14} />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 📋 TRANSACTIONS */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 xl:p-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-black bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-2">
                Recent Transactions
              </h2>
              <p className="text-xl text-white/70 font-semibold">
                {transactions.length} total •{" "}
                <span className="text-emerald-400">
                  ₹{(totalIncome - totalExpense).toLocaleString("en-IN")} net
                </span>
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-semibold rounded-2xl hover:from-slate-500 hover:to-slate-600 transition-all duration-300 shadow-lg shadow-slate-500/25">
                Export CSV
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-2xl shadow-lg shadow-orange-500/25 hover:from-orange-400 hover:to-orange-500 transition-all duration-300">
                Filters
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-white/20 border-t-emerald-400 rounded-full animate-spin mr-4"></div>
                <span className="text-xl text-white/60 font-semibold">
                  Loading your transactions...
                </span>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-emerald-400/20 to-indigo-400/20 rounded-3xl flex items-center justify-center shadow-2xl">
                  <span className="text-4xl">📊</span>
                </div>
                <h3 className="text-2xl font-black mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  No transactions yet
                </h3>
                <p className="text-xl text-white/60 mb-8 max-w-md mx-auto">
                  Start tracking your finances by adding your first transaction
                  above!
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-10 py-4 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 text-slate-900 text-xl font-black rounded-3xl shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-400/70 hover:scale-105 transition-all duration-300 transform"
                >
                  ➕ Add First Transaction
                </button>
              </div>
            ) : (
              transactions.slice(0, 10).map((t) => {
                const category = CATEGORIES.find((c) => c.id === t.category);
                return (
                  <div
                    key={t.id}
                    className="group flex items-center justify-between p-6 rounded-3xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-indigo-500/20 to-emerald-500/20 p-3 flex-shrink-0 shadow-xl group-hover:scale-110 transition-transform duration-300">
                        <span className="text-2xl font-bold block">
                          {category?.name.split(" ")[0][0] || "O"}
                        </span>
                        <span className="text-xs font-semibold block text-white/70">
                          {category?.name.split(" ")[0] || "Other"}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xl font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                          {t.description}
                        </p>
                        <p className="text-sm text-white/60 mt-1">
                          {category?.name || "Other"} •{" "}
                          <span className="text-emerald-400 font-semibold">
                            {t.type === "income" ? "Income" : "Expense"}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-6 flex-shrink-0">
                      <p
                        className={`text-2xl font-black ${
                          t.type === "income"
                            ? "text-emerald-400 drop-shadow-lg"
                            : "text-red-400 drop-shadow-lg"
                        }`}
                      >
                        {t.type === "income" ? "+" : "-"}₹
                        {t.amount.toLocaleString("en-IN")}
                      </p>
                      <button
                        onClick={() => deleteTransaction(t.id)}
                        className="mt-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 hover:text-red-200 text-sm font-semibold rounded-xl transition-all duration-200 group-hover:scale-105 flex items-center gap-1"
                      >
                        <span>🗑️</span> Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/*  ENHANCED MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-3xl border border-white/20 rounded-4xl w-full max-w-2xl p-10 max-h-[90vh] overflow-y-auto shadow-3xl shadow-emerald-500/25">
            <div className="text-center mb-10">
              <h3 className="text-4xl font-black bg-gradient-to-r from-emerald-400 via-white to-emerald-400 bg-clip-text text-transparent mb-3">
                New Transaction
              </h3>
              <p className="text-xl text-white/80">Track your money movement</p>
            </div>

            <form onSubmit={addTransaction} className="space-y-8">
              <div>
                <label className="block text-white/80 font-semibold mb-3 text-lg">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Groceries at Big Bazaar, Salary from Company, etc."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full rounded-3xl bg-white/20 border-2 border-white/30 px-8 py-6 text-xl placeholder-white/50 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/30 transition-all duration-300 hover:border-white/50"
                  required
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 font-semibold mb-3 text-lg">
                    Amount
                  </label>
                  <input
                    type="number"
                    placeholder="1200"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="w-full rounded-3xl bg-white/20 border-2 border-white/30 px-8 py-6 text-2xl placeholder-white/50 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/30 transition-all duration-300 hover:border-white/50 font-mono tracking-wider"
                    required
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-white/80 font-semibold mb-3 text-lg">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full rounded-3xl bg-white/20 border-2 border-white/30 px-8 py-6 text-xl focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/30 transition-all duration-300 hover:border-white/50 appearance-none bg-no-repeat bg-right"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white/80 font-semibold mb-3 text-lg">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full rounded-3xl bg-white/20 border-2 border-white/30 px-8 py-6 text-xl focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/30 transition-all duration-300 hover:border-white/50 appearance-none"
                >
                  <option value="expense">💸 Expense</option>
                  <option value="income">💰 Income</option>
                </select>
              </div>

              <div className="flex gap-6 pt-8">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 h-16 rounded-3xl border-2 border-white/30 py-4 text-xl font-black bg-white/5 backdrop-blur-xl hover:bg-white/15 hover:border-white/50 transition-all duration-300 hover:scale-[1.02] shadow-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-16 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 text-slate-900 text-xl font-black rounded-3xl shadow-3xl shadow-emerald-500/50 hover:shadow-emerald-400/70 hover:scale-[1.02] transition-all duration-300 transform"
                >
                  💾 Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardHome;
