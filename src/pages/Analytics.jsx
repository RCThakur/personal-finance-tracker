// src/pages/Analytics.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
} from "recharts";

const CATEGORIES = [
  { id: "food", name: "Food 🍎", color: "#10B981" },
  { id: "transport", name: "Transport 🚗", color: "#3B82F6" },
  { id: "bills", name: "Bills ⚡", color: "#F59E0B" },
  { id: "entertainment", name: "Entertainment 🎮", color: "#EC4899" },
  { id: "salary", name: "Salary 💼", color: "#10B981" },
  { id: "other", name: "Other ➕", color: "#6B7280" },
];

const Analytics = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d"); // 7d, 30d, 90d, all

  // Load transactions (same as dashboard)
  useEffect(() => {
    if (!user?.uid) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(data);
      setLoading(false);
    });

    return () => unsub();
  }, [user?.uid]);

  // Filter transactions by time range
  const filterTransactionsByTime = (transactions, range) => {
    const now = new Date();
    let cutoff;

    switch (range) {
      case "7d":
        cutoff = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        cutoff = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        cutoff = new Date(now - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        return transactions;
    }

    return transactions.filter(
      (t) => new Date(t.createdAt?.toDate()) >= cutoff
    );
  };

  const filteredTransactions = filterTransactionsByTime(
    transactions,
    timeRange
  );

  // Calculate category spending
  const categorySpending = CATEGORIES.map((cat) => {
    const amount = filteredTransactions
      .filter((t) => t.category === cat.id && t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return { ...cat, amount };
  }).sort((a, b) => b.amount - a.amount);

  // Monthly trend data (real data!)
  const getMonthlyTrendData = () => {
    const monthlyData = {};
    filteredTransactions.forEach((t) => {
      const date = new Date(t.createdAt?.toDate());
      const month = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      if (!monthlyData[month]) {
        monthlyData[month] = { month, income: 0, expense: 0 };
      }
      if (t.type === "income") {
        monthlyData[month].income += t.amount;
      } else {
        monthlyData[month].expense += t.amount;
      }
    });

    return Object.values(monthlyData).sort(
      (a, b) => new Date(a.month) - new Date(b.month)
    );
  };

  const trendData = getMonthlyTrendData();

  // Calculate stats
  const totalIncome = filteredTransactions.reduce(
    (sum, t) => (t.type === "income" ? sum + t.amount : sum),
    0
  );
  const totalExpense = filteredTransactions.reduce(
    (sum, t) => (t.type === "expense" ? sum + t.amount : sum),
    0
  );
  const avgDailySpend = totalExpense / (filteredTransactions.length || 1);
  const topCategory = categorySpending[0];
  const expenseRatio =
    totalIncome > 0 ? ((totalExpense / totalIncome) * 100).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-white/20 border-t-emerald-400 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* 🎯 HEADER */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-emerald-500/10 border border-white/20 rounded-3xl p-8 backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-xl text-white/70">
              Deep insights into your spending patterns •{" "}
              <span className="text-emerald-400 font-semibold">
                {filteredTransactions.length} transactions analyzed
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {["7d", "30d", "90d", "all"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                  timeRange === range
                    ? "bg-emerald-500 text-slate-900 shadow-xl shadow-emerald-500/50"
                    : "bg-white/10 border border-white/30 hover:bg-white/20"
                }`}
              >
                {range === "7d" && "7 Days"}
                {range === "30d" && "30 Days"}
                {range === "90d" && "90 Days"}
                {range === "all" && "All Time"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 📊 KEY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-400/30 rounded-3xl p-8 backdrop-blur-xl hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-500 hover:-translate-y-2">
          <p className="text-white/60 text-sm uppercase tracking-wide mb-2">
            Total Income
          </p>
          <p className="text-4xl font-black text-emerald-400 group-hover:text-emerald-300">
            ₹{totalIncome.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="group bg-gradient-to-br from-red-500/10 to-rose-600/10 border border-red-400/30 rounded-3xl p-8 backdrop-blur-xl hover:shadow-2xl hover:shadow-red-500/25 transition-all duration-500 hover:-translate-y-2">
          <p className="text-white/60 text-sm uppercase tracking-wide mb-2">
            Total Expenses
          </p>
          <p className="text-4xl font-black text-red-400 group-hover:text-red-300">
            ₹{totalExpense.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="group bg-gradient-to-br from-purple-500/10 to-violet-600/10 border border-purple-400/30 rounded-3xl p-8 backdrop-blur-xl hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 hover:-translate-y-2">
          <p className="text-white/60 text-sm uppercase tracking-wide mb-2">
            Avg Daily Spend
          </p>
          <p className="text-4xl font-black text-purple-400 group-hover:text-purple-300">
            ₹
            {avgDailySpend.toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}
          </p>
        </div>
        <div className="group bg-gradient-to-br from-orange-500/10 to-amber-600/10 border border-orange-400/30 rounded-3xl p-8 backdrop-blur-xl hover:shadow-2xl hover:shadow-orange-500/25 transition-all duration-500 hover:-translate-y-2">
          <p className="text-white/60 text-sm uppercase tracking-wide mb-2">
            Expense Ratio
          </p>
          <p className="text-4xl font-black text-orange-400 group-hover:text-orange-300">
            {expenseRatio}%
          </p>
        </div>
      </div>

      {/* 📈 CHARTS GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* TREND LINE CHART */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 xl:p-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
              Spending Trends
            </h2>
            <div className="flex items-center gap-2 text-sm bg-emerald-400/20 text-emerald-300 px-4 py-2 rounded-2xl font-semibold">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              Live Data
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trendData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="white/10"
                vertical={false}
              />
              <XAxis dataKey="month" stroke="white" fontSize={14} />
              <YAxis stroke="white" fontSize={14} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#10B981"
                strokeWidth={4}
                dot={{ fill: "#10B981", strokeWidth: 2 }}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#EF4444"
                strokeWidth={4}
                dot={{ fill: "#EF4444", strokeWidth: 2 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* TOP CATEGORIES BAR CHART */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 xl:p-10 space-y-8">
          <h2 className="text-2xl font-black bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
            Top Spending Categories
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categorySpending.slice(0, 6)} layout="vertical">
              <XAxis type="number" stroke="white" fontSize={14} />
              <YAxis
                dataKey="name"
                type="category"
                stroke="white"
                fontSize={14}
                width={120}
              />
              <Tooltip />
              {categorySpending.slice(0, 6).map((entry, index) => (
                <Bar
                  key={`bar-${index}`}
                  dataKey="amount"
                  fill={entry.color}
                  radius={[4, 4, 4, 4]}
                  barSize={24}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 📋 DETAILED BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CATEGORY TABLE */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <h3 className="text-2xl font-black bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-6">
            Category Breakdown
          </h3>
          <div className="space-y-4">
            {categorySpending.map((cat, index) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: `${cat.color}20` }}
                  >
                    <span
                      className="text-lg font-bold text-white"
                      style={{ color: cat.color }}
                    >
                      {cat.name.split(" ")[0][0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{cat.name}</p>
                    <p className="text-sm text-white/60">
                      {((cat.amount / totalExpense) * 100 || 0).toFixed(1)}% of
                      total
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className="text-2xl font-black text-white"
                    style={{ color: cat.color }}
                  >
                    ₹{cat.amount.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* INSIGHTS CARDS */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-emerald-500/15 to-indigo-500/15 border border-emerald-400/30 rounded-3xl p-8 backdrop-blur-xl">
            <h4 className="text-lg font-black text-emerald-300 mb-4 flex items-center gap-2">
              🏆 Top Spender
            </h4>
            <div className="text-center">
              <p className="text-4xl font-black text-white mb-2">
                {topCategory?.name || "None"}
              </p>
              <p className="text-2xl font-bold text-emerald-400">
                ₹{topCategory?.amount?.toLocaleString("en-IN") || 0}
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/15 to-pink-500/15 border border-purple-400/30 rounded-3xl p-8 backdrop-blur-xl">
            <h4 className="text-lg font-black text-purple-300 mb-4 flex items-center gap-2">
              📈 Smart Insights
            </h4>
            <ul className="space-y-3 text-white/80">
              <li>• {filteredTransactions.length} transactions analyzed</li>
              <li>
                • Average {timeRange === "7d" ? "daily" : "monthly"} spend: ₹
                {avgDailySpend.toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </li>
              <li>
                • Your biggest category takes up{" "}
                {totalExpense > 0
                  ? ((topCategory?.amount / totalExpense) * 100 || 0).toFixed(1)
                  : 0}
                % of spending
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
