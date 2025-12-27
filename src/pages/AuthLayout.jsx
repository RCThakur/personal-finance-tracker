// src/pages/AuthLayout.jsx
import React from "react";
import { Link } from "react-router-dom";

const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen min-w-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-950 flex items-center justify-center px-4 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.15),_transparent_60%),_radial-gradient(circle_at_bottom,_rgba(59,130,246,0.18),_transparent_55%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand + back home */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="text-xs text-white/60 hover:text-white transition"
          >
            ← Back to home
          </Link>
          <span className="text-xs rounded-full border border-white/20 bg-white/5 px-3 py-1">
            Personal Finance Tracker 💰
          </span>
        </div>

        <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-2xl shadow-2xl px-6 py-7 sm:px-8 sm:py-8 space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold">{title}</h1>
            <p className="mt-1 text-sm text-white/70">{subtitle}</p>
          </div>

          {children}

          <p className="text-[11px] text-white/50 leading-relaxed">
            By continuing, you agree to our{" "}
            <button className="underline underline-offset-2 hover:text-white">
              Terms
            </button>{" "}
            and{" "}
            <button className="underline underline-offset-2 hover:text-white">
              Privacy Policy
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
