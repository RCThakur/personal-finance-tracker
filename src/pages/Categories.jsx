import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const DEFAULT_CATEGORIES = [
  { id: "food", name: "Food 🍎", color: "#10B981" },
  { id: "transport", name: "Transport 🚗", color: "#3B82F6" },
  { id: "bills", name: "Bills ⚡", color: "#F59E0B" },
  { id: "entertainment", name: "Entertainment 🎮", color: "#EC4899" },
  { id: "salary", name: "Salary 💼", color: "#10B981" },
  { id: "other", name: "Other ➕", color: "#6B7280" },
];

const Categories = () => {
  const { user } = useAuth();
  const [customCategories, setCustomCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    icon: "📁",
    color: "#10B981",
  });
  const [loading, setLoading] = useState(true);

  // Load categories + transactions
  useEffect(() => {
    if (!user?.uid) {
      setCustomCategories([]);
      setTransactions([]);
      setLoading(false);
      return;
    }

    const catQ = query(
      collection(db, "categories"),
      where("userId", "==", user.uid)
    );
    const unsubCats = onSnapshot(catQ, (snap) => {
      setCustomCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const txQ = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid)
    );
    const unsubTx = onSnapshot(txQ, (snap) => {
      setTransactions(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => {
      unsubCats();
      unsubTx();
    };
  }, [user?.uid]);

  // Merge default + custom for display
  const allCategories = [
    ...DEFAULT_CATEGORIES.map((c) => ({ ...c, isDefault: true })),
    ...customCategories.map((c) => ({
      id: c.id,
      name: `${c.name} ${c.icon || ""}`,
      color: c.color || "#10B981",
      isDefault: false,
      _raw: c,
    })),
  ];

  // Aggregate stats per category
  const getCategoryStats = (catIdOrDoc) => {
    // For defaults: id is string like "food"
    // For custom: Firestore doc has field "slug" or use document id
    const catId = catIdOrDoc.isDefault
      ? catIdOrDoc.id
      : catIdOrDoc._raw.slug || catIdOrDoc._raw.id;

    const catTx = transactions.filter((t) => t.category === catId);
    const income = catTx
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const expense = catTx
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);

    return { income, expense, count: catTx.length };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    try {
      const payload = {
        userId: user.uid,
        name: formData.name,
        icon: formData.icon || "📁",
        color: formData.color || "#10B981",
        slug: formData.name.toLowerCase().trim().replace(/\s+/g, "-"),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (editingCategory) {
        await updateDoc(doc(db, "categories", editingCategory.id), payload);
      } else {
        await addDoc(collection(db, "categories"), payload);
      }

      setFormData({ name: "", icon: "📁", color: "#10B981" });
      setEditingCategory(null);
      setShowForm(false);
    } catch (err) {
      console.error("Error saving category:", err);
      alert("Failed to save category.");
    }
  };

  const handleDelete = async (catDoc) => {
    if (
      !confirm(
        "Delete this category? Existing transactions will still keep the old category value."
      )
    )
      return;
    try {
      await deleteDoc(doc(db, "categories", catDoc.id));
    } catch (err) {
      console.error("Error deleting category:", err);
    }
  };

  const startEdit = (catDoc) => {
    setEditingCategory(catDoc);
    setFormData({
      name: catDoc.name,
      icon: catDoc.icon || "📁",
      color: catDoc.color || "#10B981",
    });
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-white/20 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-emerald-500/10 border border-white/20 rounded-3xl p-8 backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent mb-2">
                Categories
              </h1>
              <p className="text-xl text-white/70">
                Organize your finances •{" "}
                <span className="text-emerald-400 font-semibold">
                  {allCategories.length} categories in use
                </span>
              </p>
            </div>
            <button
              onClick={() => {
                setEditingCategory(null);
                setFormData({
                  name: "",
                  icon: "📁",
                  color: "#10B981",
                });
                setShowForm(true);
              }}
              className="px-8 py-4 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 text-slate-900 text-lg font-black rounded-3xl shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-400/70 hover:scale-105 transition-all duration-300 transform"
            >
              ➕ New Category
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allCategories.map((cat) => {
            const stats = getCategoryStats(cat);
            const isCustom = !cat.isDefault;
            return (
              <div
                key={cat.id}
                className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden hover:bg-white/10 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300"
              >
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    background: `radial-gradient(circle at top left, ${cat.color}, transparent 60%)`,
                  }}
                />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
                        style={{ backgroundColor: `${cat.color}33` }}
                      >
                        {cat.name.split(" ").slice(-1)[0]}
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white">
                          {cat.name}
                        </p>
                        <p className="text-xs text-white/60">
                          {stats.count} transactions
                        </p>
                      </div>
                    </div>
                    {isCustom && (
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => startEdit(cat._raw)}
                          className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(cat._raw)}
                          className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-300 font-semibold">
                        Income
                      </span>
                      <span className="text-emerald-300 font-bold">
                        ₹{stats.income.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-red-300 font-semibold">
                        Expense
                      </span>
                      <span className="text-red-300 font-bold">
                        ₹{stats.expense.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width:
                            stats.income + stats.expense > 0
                              ? `${
                                  (stats.expense /
                                    (stats.income + stats.expense)) *
                                  100
                                }%`
                              : "0%",
                          background: `linear-gradient(90deg, ${cat.color}, #f97316)`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {allCategories.length === 0 && (
            <div className="col-span-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-16 text-center">
              <h3 className="text-2xl font-black mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                No categories yet
              </h3>
              <p className="text-white/60 mb-6">
                Start by adding your first custom category.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-10 py-4 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 text-slate-900 text-xl font-black rounded-3xl shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-400/70 hover:scale-105 transition-all duration-300 transform"
              >
                ➕ Add Category
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-3xl border border-white/20 rounded-4xl w-full max-w-2xl p-10 max-h-[90vh] overflow-y-auto shadow-3xl shadow-emerald-500/25">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-black bg-gradient-to-r from-emerald-400 via-white to-emerald-400 bg-clip-text text-transparent mb-2">
                {editingCategory ? "Edit Category" : "New Category"}
              </h3>
              <p className="text-white/70">
                Customize how your transactions are grouped
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white/80 font-semibold mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Medical, Shopping, Education..."
                  className="w-full rounded-3xl bg-white/20 border-2 border-white/30 px-6 py-4 text-lg placeholder-white/50 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/30 transition-all duration-300"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 font-semibold mb-2">
                    Icon / Emoji
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={formData.icon}
                    onChange={(e) =>
                      setFormData({ ...formData, icon: e.target.value })
                    }
                    className="w-full rounded-3xl bg-white/20 border-2 border-white/30 px-6 py-4 text-lg focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/30 transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-white/80 font-semibold mb-2">
                    Color
                  </label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-full h-12 rounded-3xl bg-transparent border-2 border-white/30 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCategory(null);
                  }}
                  className="flex-1 h-12 rounded-3xl border-2 border-white/30 text-white font-bold bg-white/5 hover:bg-white/15 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 rounded-3xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 text-slate-900 font-black shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-400/70 hover:scale-[1.02] transition-all duration-300"
                >
                  💾 Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Categories;
