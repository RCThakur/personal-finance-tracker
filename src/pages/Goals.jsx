// src/pages/Goals.jsx - FULLY FIXED VERSION
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

const Goals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    targetDate: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);

  // FIXED: Simplified queries (no index needed)
  useEffect(() => {
    if (!user?.uid) {
      setGoals([]);
      setTransactions([]);
      setLoading(false);
      return;
    }

    const goalsQuery = query(
      collection(db, "goals"),
      where("userId", "==", user.uid)
    );
    const goalsUnsub = onSnapshot(goalsQuery, (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      data.sort(
        (a, b) =>
          new Date(b.createdAt?.seconds * 1000) -
          new Date(a.createdAt?.seconds * 1000)
      );
      setGoals(data);
    });

    const transactionsQuery = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid)
    );
    const transactionsUnsub = onSnapshot(transactionsQuery, (snap) => {
      setTransactions(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
      setLoading(false);
    });

    return () => {
      goalsUnsub();
      transactionsUnsub();
    };
  }, [user?.uid]);

  const getSavedAmount = (goalId) => {
    return transactions
      .filter((t) => t.type === "income" && t.goalId === goalId)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const addOrUpdateGoal = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.targetAmount) return;

    try {
      const goalData = {
        userId: user.uid,
        name: formData.name,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: getSavedAmount(editingGoal?.id || "new"),
        targetDate: formData.targetDate ? new Date(formData.targetDate) : null,
        description: formData.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (editingGoal) {
        await updateDoc(doc(db, "goals", editingGoal.id), goalData);
      } else {
        await addDoc(collection(db, "goals"), goalData);
      }

      setFormData({
        name: "",
        targetAmount: "",
        targetDate: "",
        description: "",
      });
      setShowForm(false);
      setEditingGoal(null);
    } catch (error) {
      console.error("Error saving goal:", error);
      alert(`Failed to save goal: ${error.message}`);
    }
  };

  // ✅ FIXED: Handle Firebase Timestamp properly
  const startEditGoal = (goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      targetDate: goal.targetDate
        ? (goal.targetDate.toDate ? goal.targetDate.toDate() : goal.targetDate)
            .toISOString()
            .split("T")[0]
        : "",
      description: goal.description || "",
    });
    setShowForm(true);
  };

  const deleteGoal = async (goalId) => {
    if (!confirm("Delete this goal?")) return;
    try {
      await deleteDoc(doc(db, "goals", goalId));
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
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
                Financial Goals
              </h1>
              <p className="text-xl text-white/70">
                Save for your dreams •{" "}
                <span className="text-emerald-400 font-semibold">
                  {goals.length} active goals
                </span>
              </p>
            </div>
            <button
              onClick={() => {
                setEditingGoal(null);
                setFormData({
                  name: "",
                  targetAmount: "",
                  targetDate: "",
                  description: "",
                });
                setShowForm(true);
              }}
              className="px-8 py-4 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 text-slate-900 text-lg font-black rounded-3xl shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-400/70 hover:scale-105 transition-all duration-300 transform"
            >
              🎯 New Goal
            </button>
          </div>
        </div>

        {/* 📊 GOALS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.length === 0 ? (
            <div className="col-span-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-16 text-center">
              <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-emerald-400/20 to-indigo-400/20 rounded-3xl flex items-center justify-center shadow-2xl">
                <span className="text-4xl">🎯</span>
              </div>
              <h3 className="text-2xl font-black mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                No goals yet
              </h3>
              <p className="text-xl text-white/60 mb-8 max-w-md mx-auto">
                Set your first financial goal and start tracking your progress!
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-10 py-4 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 text-slate-900 text-xl font-black rounded-3xl shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-400/70 hover:scale-105 transition-all duration-300 transform"
              >
                🎯 Create First Goal
              </button>
            </div>
          ) : (
            goals.map((goal) => {
              const saved = getSavedAmount(goal.id);
              const progress = Math.min((saved / goal.targetAmount) * 100, 100);
              const targetDate = goal.targetDate?.toDate
                ? goal.targetDate.toDate()
                : goal.targetDate;
              const daysLeft = targetDate
                ? Math.max(
                    0,
                    Math.ceil(
                      (new Date(targetDate) - new Date()) /
                        (1000 * 60 * 60 * 24)
                    )
                  )
                : null;

              return (
                <div
                  key={goal.id}
                  className="group bg-gradient-to-br from-purple-500/10 to-emerald-600/10 border border-purple-400/30 rounded-3xl p-8 backdrop-blur-xl hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden"
                >
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      background: `conic-gradient(purple ${progress}%, transparent 0%)`,
                    }}
                  />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-black bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                          {goal.name}
                        </h3>
                        {goal.description && (
                          <p className="text-white/60 text-sm mt-1">
                            {goal.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                          onClick={() => startEditGoal(goal)}
                          className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all duration-200"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteGoal(goal.id)}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-red-300 hover:text-red-200 transition-all duration-200"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-3xl lg:text-4xl font-black text-purple-400 mb-1">
                          ₹{saved.toLocaleString("en-IN")}
                        </p>
                        <p className="text-2xl font-bold text-white/80">
                          / ₹{goal.targetAmount.toLocaleString("en-IN")}
                        </p>
                        <p className="text-purple-300 text-sm font-semibold">
                          {progress.toFixed(0)}% complete
                        </p>
                      </div>

                      <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-400 to-emerald-400 rounded-full transition-all duration-1000 relative shadow-lg"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      {daysLeft !== null && (
                        <div className="text-center">
                          <p
                            className={`text-sm font-bold ${
                              daysLeft <= 7
                                ? "text-red-400"
                                : "text-emerald-400"
                            }`}
                          >
                            {daysLeft} days left
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* SUMMARY - SAME AS BEFORE */}
        {goals.length > 0 && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <h3 className="text-2xl font-black bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-6">
              Goals Progress
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-4xl font-black text-emerald-400">
                  {
                    goals.filter((g) => getSavedAmount(g.id) >= g.targetAmount)
                      .length
                  }
                </p>
                <p className="text-white/70 mt-2">✅ Achieved</p>
              </div>
              <div>
                <p className="text-4xl font-black text-purple-400">
                  {
                    goals.filter(
                      (g) => getSavedAmount(g.id) >= g.targetAmount * 0.8
                    ).length
                  }
                </p>
                <p className="text-white/70 mt-2">🔥 Close</p>
              </div>
              <div>
                <p className="text-4xl font-black text-yellow-400">
                  {
                    goals.filter(
                      (g) => getSavedAmount(g.id) < g.targetAmount * 0.5
                    ).length
                  }
                </p>
                <p className="text-white/70 mt-2">⏳ Early Stage</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL - SAME AS BEFORE */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-3xl border border-white/20 rounded-4xl w-full max-w-2xl p-10 max-h-[90vh] overflow-y-auto shadow-3xl shadow-emerald-500/25">
            <div className="text-center mb-10">
              <h3 className="text-4xl font-black bg-gradient-to-r from-purple-400 via-emerald-400 to-purple-400 bg-clip-text text-transparent mb-3">
                {editingGoal ? "Edit Goal" : "New Goal"}
              </h3>
              <p className="text-xl text-white/80">Save towards your dreams</p>
            </div>

            <form onSubmit={addOrUpdateGoal} className="space-y-8">
              <div>
                <label className="block text-white/80 font-semibold mb-3 text-lg">
                  Goal Name
                </label>
                <input
                  type="text"
                  placeholder="Vacation Fund, New Laptop, Emergency Fund"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-3xl bg-white/20 border-2 border-white/30 px-8 py-6 text-xl placeholder-white/50 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/30 transition-all duration-300 hover:border-white/50"
                  required
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 font-semibold mb-3 text-lg">
                    Target Amount
                  </label>
                  <input
                    type="number"
                    placeholder="50000"
                    value={formData.targetAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, targetAmount: e.target.value })
                    }
                    className="w-full rounded-3xl bg-white/20 border-2 border-white/30 px-8 py-6 text-2xl placeholder-white/50 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/30 transition-all duration-300 hover:border-white/50 font-mono tracking-wider"
                    required
                    step="100"
                  />
                </div>
                <div>
                  <label className="block text-white/80 font-semibold mb-3 text-lg">
                    Target Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) =>
                      setFormData({ ...formData, targetDate: e.target.value })
                    }
                    className="w-full rounded-3xl bg-white/20 border-2 border-white/30 px-8 py-6 text-xl focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/30 transition-all duration-300 hover:border-white/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/80 font-semibold mb-3 text-lg">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="What will you use this for? Add motivation!"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full rounded-3xl bg-white/20 border-2 border-white/30 px-8 py-6 text-xl placeholder-white/50 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/30 transition-all duration-300 hover:border-white/50 resize-vertical"
                />
              </div>

              <div className="flex gap-6 pt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingGoal(null);
                    setFormData({
                      name: "",
                      targetAmount: "",
                      targetDate: "",
                      description: "",
                    });
                  }}
                  className="flex-1 h-16 rounded-3xl border-2 border-white/30 py-4 text-xl font-black bg-white/5 backdrop-blur-xl hover:bg-white/15 hover:border-white/50 transition-all duration-300 hover:scale-[1.02] shadow-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-16 bg-gradient-to-r from-purple-400 via-emerald-500 to-purple-600 text-slate-900 text-xl font-black rounded-3xl shadow-3xl shadow-emerald-500/50 hover:shadow-emerald-400/70 hover:scale-[1.02] transition-all duration-300 transform"
                >
                  🎯 Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Goals;
