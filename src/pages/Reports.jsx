// src/pages/Reports.jsx
import React, { useState, useEffect, useRef } from "react";
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
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import jsPDF from "jspdf";
import "jspdf-autotable";

const CATEGORIES = [
  { id: "food", name: "Food 🍎", color: "#10B981" },
  { id: "transport", name: "Transport 🚗", color: "#3B82F6" },
  { id: "bills", name: "Bills ⚡", color: "#F59E0B" },
  { id: "entertainment", name: "Entertainment 🎮", color: "#EC4899" },
  { id: "salary", name: "Salary 💼", color: "#10B981" },
  { id: "other", name: "Other ➕", color: "#6B7280" },
];

const Reports = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [reportType, setReportType] = useState("overview");
  const pdfRef = useRef();

  // Load all data
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const unsubs = [];

    // Transactions
    const txQuery = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid)
    );
    unsubs.push(
      onSnapshot(txQuery, (snap) => {
        setTransactions(
          snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      })
    );

    // Budgets
    const budgetQuery = query(
      collection(db, "budgets"),
      where("userId", "==", user.uid)
    );
    unsubs.push(
      onSnapshot(budgetQuery, (snap) => {
        setBudgets(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      })
    );

    // Goals
    const goalQuery = query(
      collection(db, "goals"),
      where("userId", "==", user.uid)
    );
    unsubs.push(
      onSnapshot(goalQuery, (snap) => {
        setGoals(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      })
    );

    return () => unsubs.forEach((unsub) => unsub());
  }, [user?.uid]);

  // Filter by time range
  const filterTransactionsByTime = (txs, range) => {
    const now = new Date();
    let cutoff;
    switch (range) {
      case "7d":
        cutoff = new Date(now - 7 * 86400000);
        break;
      case "30d":
        cutoff = new Date(now - 30 * 86400000);
        break;
      case "90d":
        cutoff = new Date(now - 90 * 86400000);
        break;
      default:
        return txs;
    }
    return txs.filter(
      (t) => new Date(t.createdAt?.seconds * 1000 || t.createdAt) >= cutoff
    );
  };

  const filteredTx = filterTransactionsByTime(transactions, timeRange);

  // Calculate comprehensive stats
  const totalIncome = filteredTx
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredTx
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const netWorth = totalIncome - totalExpense;
  const savingsRate =
    totalIncome > 0 ? ((netWorth / totalIncome) * 100).toFixed(1) : 0;

  // Category breakdown
  const categoryBreakdown = CATEGORIES.map((cat) => {
    const spent = filteredTx
      .filter((t) => t.category === cat.id && t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return { name: cat.name, value: spent, fill: cat.color };
  }).filter((d) => d.value > 0);

  // Monthly trends
  const monthlyTrends = {};
  filteredTx.forEach((t) => {
    const date = new Date(t.createdAt?.seconds * 1000 || t.createdAt);
    const month = date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    if (!monthlyTrends[month])
      monthlyTrends[month] = { month, income: 0, expense: 0 };
    monthlyTrends[month][t.type] += t.amount;
  });
  const trendData = Object.values(monthlyTrends);

  // Budget performance
  const budgetPerformance = budgets.map((budget) => {
    const monthStart = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );
    const spent = transactions
      .filter(
        (t) =>
          t.category === budget.category &&
          t.type === "expense" &&
          new Date(t.createdAt?.seconds * 1000 || t.createdAt) >= monthStart
      )
      .reduce((sum, t) => sum + t.amount, 0);
    const variance = budget.amount - spent;
    return {
      name: budget.name,
      budgeted: budget.amount,
      spent,
      variance,
      status: variance >= 0 ? "good" : "over",
    };
  });

  // Goal progress
  const goalProgress = goals.map((goal) => {
    const saved = transactions
      .filter((t) => t.goalId === goal.id && t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      name: goal.name,
      target: goal.targetAmount,
      saved,
      progress: Math.min((saved / goal.targetAmount) * 100, 100),
    };
  });

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`Financial Report - ${new Date().toLocaleDateString()}`, 20, 30);

    doc.setFontSize(12);
    doc.text(
      `Period: ${timeRange.toUpperCase()} | Net Worth: ₹${netWorth.toLocaleString(
        "en-IN"
      )}`,
      20,
      50
    );
    doc.text(
      `Income: ₹${totalIncome.toLocaleString(
        "en-IN"
      )} | Expenses: ₹${totalExpense.toLocaleString("en-IN")}`,
      20,
      65
    );

    // Budget table
    doc.autoTable({
      startY: 80,
      head: [["Category", "Budgeted", "Spent", "Variance"]],
      body: budgetPerformance.map((b) => [
        b.name,
        `₹${b.budgeted.toLocaleString("en-IN")}`,
        `₹${b.spent.toLocaleString("en-IN")}`,
        b.variance >= 0
          ? `+₹${b.variance.toLocaleString("en-IN")}`
          : `₹${Math.abs(b.variance).toLocaleString("en-IN")} over`,
      ]),
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [16, 185, 129] },
    });

    doc.save(`financial-report-${Date.now()}.pdf`);
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
    <div className="max-w-7xl mx-auto p-6 space-y-8" ref={pdfRef}>
      {/* 🎯 HEADER */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-emerald-500/10 border border-white/20 rounded-3xl p-8 backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent mb-2">
              Financial Reports
            </h1>
            <p className="text-xl text-white/70">
              Complete analysis •{" "}
              <span className="text-emerald-400 font-semibold">
                {filteredTx.length} transactions • ₹
                {netWorth.toLocaleString("en-IN")} net worth
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
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
                {range === "all" ? "All Time" : `${range.toUpperCase()} Days`}
              </button>
            ))}
            <button
              onClick={exportPDF}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black rounded-2xl shadow-xl shadow-orange-500/50 hover:shadow-orange-400/70 hover:scale-105 transition-all duration-300"
            >
              📄 Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* 📊 KEY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-400/30 rounded-3xl p-8 backdrop-blur-xl hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-500 hover:-translate-y-2 text-center">
          <p className="text-white/60 text-sm uppercase tracking-wide mb-2">
            Net Worth
          </p>
          <p className="text-4xl font-black text-emerald-400 group-hover:text-emerald-300">
            ₹{netWorth.toLocaleString("en-IN")}
          </p>
          <p className="text-emerald-300 text-sm mt-1">
            {savingsRate}% savings rate
          </p>
        </div>
        <div className="group bg-gradient-to-br from-blue-500/10 to-indigo-600/10 border border-blue-400/30 rounded-3xl p-8 backdrop-blur-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 hover:-translate-y-2 text-center">
          <p className="text-white/60 text-sm uppercase tracking-wide mb-2">
            Total Income
          </p>
          <p className="text-4xl font-black text-blue-400">
            ₹{totalIncome.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="group bg-gradient-to-br from-red-500/10 to-rose-600/10 border border-red-400/30 rounded-3xl p-8 backdrop-blur-xl hover:shadow-2xl hover:shadow-red-500/25 transition-all duration-500 hover:-translate-y-2 text-center">
          <p className="text-white/60 text-sm uppercase tracking-wide mb-2">
            Total Expenses
          </p>
          <p className="text-4xl font-black text-red-400">
            ₹{totalExpense.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="group bg-gradient-to-br from-purple-500/10 to-violet-600/10 border border-purple-400/30 rounded-3xl p-8 backdrop-blur-xl hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 hover:-translate-y-2 text-center">
          <p className="text-white/60 text-sm uppercase tracking-wide mb-2">
            Transactions
          </p>
          <p className="text-4xl font-black text-purple-400">
            {filteredTx.length}
          </p>
        </div>
      </div>

      {/* 📈 REPORTS TABS */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
        <div className="flex flex-wrap gap-3 mb-8">
          {[
            { id: "overview", label: "Overview", icon: "📊" },
            { id: "trends", label: "Trends", icon: "📈" },
            { id: "categories", label: "Categories", icon: "📋" },
            { id: "budgets", label: "Budgets", icon: "💳" },
            { id: "goals", label: "Goals", icon: "🎯" },
          ].map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setReportType(id)}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                reportType === id
                  ? "bg-emerald-500 text-slate-900 shadow-xl shadow-emerald-500/50"
                  : "bg-white/10 border border-white/30 hover:bg-white/20"
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {reportType === "overview" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <h3 className="text-2xl font-black bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-8">
                Spending by Category
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    dataKey="value"
                    nameKey="name"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <h3 className="text-2xl font-black bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-8">
                Monthly Trends
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="white/10" />
                  <XAxis dataKey="month" stroke="white" />
                  <YAxis stroke="white" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#10B981"
                    strokeWidth={3}
                  />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    stroke="#EF4444"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* BUDGETS & GOALS */}
        {(reportType === "budgets" || reportType === "goals") && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-2xl font-black bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                {reportType === "budgets"
                  ? "Budget Performance"
                  : "Goal Progress"}
              </h3>
              {budgetPerformance.map((budget, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-6 rounded-2xl bg-white/10"
                >
                  <div>
                    <p className="font-bold text-white">{budget.name}</p>
                    <p className="text-sm text-white/60">
                      Spent{" "}
                      {((budget.spent / budget.budgeted) * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-emerald-400">
                      ₹{budget.spent.toLocaleString("en-IN")}
                    </p>
                    <p
                      className={`text-sm font-semibold ${
                        budget.variance >= 0
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {budget.variance >= 0 ? "+" : ""}₹
                      {Math.abs(budget.variance).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 📋 TRANSACTION SUMMARY */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
        <h3 className="text-2xl font-black bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-6">
          Recent Activity ({filteredTx.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-4 text-white/70">Description</th>
                <th className="text-left py-4 text-white/70">Category</th>
                <th className="text-right py-4 text-white/70">Amount</th>
                <th className="text-right py-4 text-white/70">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredTx.slice(0, 10).map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-white/10 hover:bg-white/10 transition-colors"
                >
                  <td className="py-4 font-semibold text-white">
                    {t.description}
                  </td>
                  <td className="py-4 text-white/70">
                    {CATEGORIES.find((c) => c.id === t.category)?.name ||
                      t.category}
                  </td>
                  <td
                    className={`py-4 font-black text-2xl text-right ${
                      t.type === "income" ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}₹
                    {t.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="py-4 text-white/60 text-right">
                    {new Date(
                      t.createdAt?.seconds * 1000 || t.createdAt
                    ).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
