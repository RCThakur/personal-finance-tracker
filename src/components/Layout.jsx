// src/components/Layout.jsx - FULL WORKING VERSION
import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  HomeIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  FlagIcon,
  DocumentTextIcon,
  Cog8ToothIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";

  const menuItems = [
    { icon: HomeIcon, label: "Dashboard", path: "/dashboard" },
    { icon: ChartBarIcon, label: "Analytics", path: "/dashboard/analytics" },
    { icon: CurrencyDollarIcon, label: "Budgets", path: "/dashboard/budgets" },
    { icon: FlagIcon, label: "Goals", path: "/dashboard/goals" },
    { icon: DocumentTextIcon, label: "Reports", path: "/dashboard/reports" },
    { icon: Cog8ToothIcon, label: "Categories", path: "/dashboard/categories" },
    { icon: UserIcon, label: "Profile", path: "/dashboard/profile" },
  ];

  return (
    <div className="min-h-screen min-w-screen bg-gradient-to-br from-slate-900 via-indigo-900/30 to-slate-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-400 rounded-xl flex items-center justify-center">
                <span className="text-slate-900 font-bold text-sm">💰</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold">Finance Tracker</h1>
                <p className="text-xs text-white/60">
                  Welcome back, {displayName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={logout}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-white/10 bg-white/5 backdrop-blur-xl hidden lg:block">
          <nav className="p-6 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl text-sm font-medium transition-all group hover:bg-white/10 hover:translate-x-1"
              >
                <item.icon className="w-5 h-5 text-white/70 group-hover:text-white" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
