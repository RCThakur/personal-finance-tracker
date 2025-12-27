// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const Profile = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    theme: "dark",
    currency: "INR",
    language: "en",
    notifications: true,
    monthlyReport: true,
  });
  const [stats, setStats] = useState({
    transactions: 0,
    budgets: 0,
    goals: 0,
    categories: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);

  // Load user settings and stats
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    // Load settings
    const settingsRef = doc(db, "userSettings", user.uid);
    const unsubSettings = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      }
      setLoading(false);
    });

    // Load stats from all collections
    const collections = ["transactions", "budgets", "goals", "categories"];
    collections.forEach(async (collectionName) => {
      const q = query(
        collection(db, collectionName),
        where("userId", "==", user.uid)
      );
      const snap = await getDocs(q);
      setStats((prev) => ({ ...prev, [collectionName]: snap.size }));
    });

    return () => unsubSettings();
  }, [user?.uid]);

  const updateSettings = async (newSettings) => {
    if (!user?.uid) return;

    setSaving(true);
    try {
      await setDoc(
        doc(db, "userSettings", user.uid),
        {
          ...settings,
          ...newSettings,
          updatedAt: new Date(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const exportAllData = async () => {
    // Simple CSV export example
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Email,Transactions,Budgets,Goals,Categories\n" +
      `${user?.email},${stats.transactions},${stats.budgets},${stats.goals},${stats.categories}`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `profile-data-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-white/20 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* 🎯 HEADER */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-emerald-500/10 border border-white/20 rounded-3xl p-8 backdrop-blur-xl text-center">
        <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-emerald-400/30 to-indigo-400/30 rounded-full flex items-center justify-center shadow-2xl">
          <span className="text-5xl">
            {user?.displayName?.[0]?.toUpperCase() ||
              user?.email?.[0]?.toUpperCase() ||
              "👤"}
          </span>
        </div>
        <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent mb-2">
          {user?.displayName || user?.email?.split("@")[0] || "User"}
        </h1>
        <p className="text-xl text-white/70 mb-6">
          {user?.email}
          {user?.emailVerified ? (
            <span className="ml-2 px-3 py-1 bg-emerald-400/20 text-emerald-300 rounded-full text-sm font-semibold">
              Verified ✓
            </span>
          ) : (
            <span className="ml-2 px-3 py-1 bg-orange-400/20 text-orange-300 rounded-full text-sm font-semibold">
              Verify Email
            </span>
          )}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => setShowSubscription(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl shadow-xl shadow-purple-500/50 hover:shadow-purple-400/70 hover:scale-105 transition-all duration-300"
          >
            🏆 Upgrade Pro
          </button>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-semibold rounded-2xl shadow-lg shadow-slate-500/25 hover:from-slate-500 hover:to-slate-600 transition-all duration-300"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* 📊 STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-400/30 rounded-3xl p-8 backdrop-blur-xl hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-500 hover:-translate-y-2 text-center">
          <div className="w-12 h-12 bg-emerald-400/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-emerald-500 text-xl">📊</span>
          </div>
          <p className="text-3xl font-black text-emerald-400">
            {stats.transactions}
          </p>
          <p className="text-white/60 text-sm mt-1">Transactions</p>
        </div>
        <div className="group bg-gradient-to-br from-blue-500/10 to-indigo-600/10 border border-blue-400/30 rounded-3xl p-8 backdrop-blur-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 hover:-translate-y-2 text-center">
          <div className="w-12 h-12 bg-blue-400/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-blue-500 text-xl">💳</span>
          </div>
          <p className="text-3xl font-black text-blue-400">{stats.budgets}</p>
          <p className="text-white/60 text-sm mt-1">Budgets</p>
        </div>
        <div className="group bg-gradient-to-br from-purple-500/10 to-violet-600/10 border border-purple-400/30 rounded-3xl p-8 backdrop-blur-xl hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 hover:-translate-y-2 text-center">
          <div className="w-12 h-12 bg-purple-400/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-purple-500 text-xl">🎯</span>
          </div>
          <p className="text-3xl font-black text-purple-400">{stats.goals}</p>
          <p className="text-white/60 text-sm mt-1">Goals</p>
        </div>
        <div className="group bg-gradient-to-br from-orange-500/10 to-amber-600/10 border border-orange-400/30 rounded-3xl p-8 backdrop-blur-xl hover:shadow-2xl hover:shadow-orange-500/25 transition-all duration-500 hover:-translate-y-2 text-center">
          <div className="w-12 h-12 bg-orange-400/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-orange-500 text-xl">🏷️</span>
          </div>
          <p className="text-3xl font-black text-orange-400">
            {stats.categories}
          </p>
          <p className="text-white/60 text-sm mt-1">Categories</p>
        </div>
      </div>

      {/* ⚙️ SETTINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Preferences */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <h2 className="text-2xl font-black bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-8">
            Preferences
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-white/80 font-semibold mb-3 text-lg">
                Theme
              </label>
              <select
                value={settings.theme}
                onChange={(e) => updateSettings({ theme: e.target.value })}
                className="w-full rounded-3xl bg-white/20 border-2 border-white/30 px-6 py-4 text-lg focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/30 transition-all duration-300"
              >
                <option value="dark">🌙 Dark</option>
                <option value="light">☀️ Light</option>
                <option value="system">💻 System</option>
              </select>
            </div>

            <div>
              <label className="block text-white/80 font-semibold mb-3 text-lg">
                Currency
              </label>
              <select
                value={settings.currency}
                onChange={(e) => updateSettings({ currency: e.target.value })}
                className="w-full rounded-3xl bg-white/20 border-2 border-white/30 px-6 py-4 text-lg focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/30 transition-all duration-300"
              >
                <option value="INR">₹ INR</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl">
              <span className="text-white/80 font-semibold">
                Email Notifications
              </span>
              <button
                onClick={() =>
                  updateSettings({ notifications: !settings.notifications })
                }
                className={`w-12 h-6 rounded-full transition-all duration-300 ${
                  settings.notifications
                    ? "bg-emerald-500 shadow-emerald-500/50"
                    : "bg-white/20"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                    settings.notifications ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl">
              <span className="text-white/80 font-semibold">
                Monthly Reports
              </span>
              <button
                onClick={() =>
                  updateSettings({ monthlyReport: !settings.monthlyReport })
                }
                className={`w-12 h-6 rounded-full transition-all duration-300 ${
                  settings.monthlyReport
                    ? "bg-emerald-500 shadow-emerald-500/50"
                    : "bg-white/20"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                    settings.monthlyReport ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-emerald-500/15 to-indigo-500/15 border border-emerald-400/30 rounded-3xl p-8 backdrop-blur-xl">
            <h3 className="text-xl font-black text-emerald-300 mb-4 flex items-center gap-2">
              📈 Usage Stats
            </h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-black text-white">
                  {stats.transactions}
                </p>
                <p className="text-emerald-300 text-sm">Total Transactions</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">{stats.goals}</p>
                <p className="text-emerald-300 text-sm">Active Goals</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <h3 className="text-xl font-black bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-6">
              Account Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={exportAllData}
                className="w-full p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-400/50 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
              >
                💾 Export All Data
              </button>
              <button className="w-full p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-2xl shadow-lg shadow-orange-500/25 hover:shadow-orange-400/50 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2">
                🔑 Change Password
              </button>
              <button className="w-full p-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-semibold rounded-2xl shadow-lg shadow-slate-500/25 hover:shadow-slate-400/50 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2">
                📧 Verify Email
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Modal */}
      {showSubscription && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-3xl border border-white/20 rounded-4xl max-w-md w-full p-8 shadow-3xl shadow-purple-500/25">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-black bg-gradient-to-r from-purple-400 via-emerald-400 to-purple-400 bg-clip-text text-transparent mb-3">
                Go Pro! 🚀
              </h3>
              <p className="text-xl text-white/80">Unlock premium features</p>
            </div>
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
                <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                <span className="text-white">Unlimited goals & budgets</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
                <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                <span className="text-white">Advanced analytics</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
                <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                <span className="text-white">PDF reports & exports</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowSubscription(false)}
                className="h-14 rounded-3xl border-2 border-white/30 text-white font-bold bg-white/5 hover:bg-white/15 transition-all duration-300"
              >
                Later
              </button>
              <button className="h-14 rounded-3xl bg-gradient-to-r from-purple-500 via-emerald-500 to-purple-600 text-white font-black shadow-2xl shadow-purple-500/50 hover:shadow-purple-400/70 hover:scale-[1.02] transition-all duration-300">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
