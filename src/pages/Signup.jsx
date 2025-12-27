// src/pages/Signup.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import AuthLayout from "../components/AuthLayout";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    if (password !== confirmPassword) {
      setErrorMsg("Passwords don't match!");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters!");
      setLoading(false);
      return;
    }

    try {
      // Create user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update profile
      await updateProfile(user, { displayName: name });

      // Create user settings doc
      await setDoc(doc(db, "userSettings", user.uid), {
        theme: "dark",
        currency: "INR",
        language: "en",
        notifications: true,
        monthlyReport: true,
        createdAt: new Date(),
      });

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setErrorMsg(
        error.code === "auth/email-already-in-use"
          ? "Email already exists. Please use a different email."
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Join FinTrack 💰"
      subtitle="Create your account to start tracking your finances."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* NAME INPUT */}
        <div className="group">
          <label className="block text-sm font-semibold text-white/80 mb-2 tracking-wide">
            Full Name
          </label>
          <div className="relative">
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Rinkesh Thakur"
              className="
                w-full relative overflow-hidden rounded-3xl border-2 border-white/20 
                bg-white/5/90 backdrop-blur-xl px-5 py-4 text-lg 
                placeholder:text-white/40 placeholder:font-medium
                focus:border-emerald-400/80 focus:ring-4 focus:ring-emerald-400/30
                focus:outline-none transition-all duration-300 ease-out
                group-hover:border-white/30 group-focus-within:border-emerald-400/80
                before:absolute before:inset-0 before:bg-gradient-to-r 
                before:from-emerald-400/10 before:to-transparent 
                before:-translate-x-full group-hover:before:translate-x-0
                before:transition-transform before:duration-700
              "
            />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500/20 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </div>
        </div>

        {/* EMAIL INPUT */}
        <div className="group">
          <label className="block text-sm font-semibold text-white/80 mb-2 tracking-wide">
            Email Address
          </label>
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="
                w-full relative overflow-hidden rounded-3xl border-2 border-white/20 
                bg-white/5/90 backdrop-blur-xl px-5 py-4 text-lg 
                placeholder:text-white/40 placeholder:font-medium
                focus:border-emerald-400/80 focus:ring-4 focus:ring-emerald-400/30
                focus:outline-none transition-all duration-300 ease-out
                group-hover:border-white/30 group-focus-within:border-emerald-400/80
                before:absolute before:inset-0 before:bg-gradient-to-r 
                before:from-emerald-400/10 before:to-transparent 
                before:-translate-x-full group-hover:before:translate-x-0
                before:transition-transform before:duration-700
              "
            />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500/20 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </div>
        </div>

        {/* PASSWORD INPUT */}
        <div className="group">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-white/80 tracking-wide">
              Password
            </label>
            <button
              type="button"
              className="text-xs font-semibold text-emerald-300 hover:text-emerald-200 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
              onClick={() => setShowPassword((p) => !p)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              placeholder="At least 6 characters"
              className="
                w-full relative overflow-hidden rounded-3xl border-2 border-white/20 
                bg-white/5/90 backdrop-blur-xl px-5 py-4 text-lg 
                placeholder:text-white/40 placeholder:font-medium
                focus:border-emerald-400/80 focus:ring-4 focus:ring-emerald-400/30
                focus:outline-none transition-all duration-300 ease-out
                group-hover:border-white/30 group-focus-within:border-emerald-400/80
                before:absolute before:inset-0 before:bg-gradient-to-r 
                before:from-emerald-400/10 before:to-transparent 
                before:-translate-x-full group-hover:before:translate-x-0
                before:transition-transform before:duration-700
              "
            />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500/20 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </div>
        </div>

        {/* CONFIRM PASSWORD INPUT */}
        <div className="group">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-white/80 tracking-wide">
              Confirm Password
            </label>
            <button
              type="button"
              className="text-xs font-semibold text-emerald-300 hover:text-emerald-200 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
              onClick={() => setShowConfirmPassword((p) => !p)}
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              minLength={6}
              placeholder="Confirm your password"
              className="
                w-full relative overflow-hidden rounded-3xl border-2 border-white/20 
                bg-white/5/90 backdrop-blur-xl px-5 py-4 text-lg 
                placeholder:text-white/40 placeholder:font-medium
                focus:border-emerald-400/80 focus:ring-4 focus:ring-emerald-400/30
                focus:outline-none transition-all duration-300 ease-out
                group-hover:border-white/30 group-focus-within:border-emerald-400/80
                before:absolute before:inset-0 before:bg-gradient-to-r 
                before:from-emerald-400/10 before:to-transparent 
                before:-translate-x-full group-hover:before:translate-x-0
                before:transition-transform before:duration-700
              "
            />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500/20 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {errorMsg && (
          <div className="relative p-4 bg-gradient-to-r from-red-500/15 to-red-600/10 border border-red-400/40 rounded-3xl backdrop-blur-xl shadow-xl shadow-red-500/25 animate-in slide-in-from-top-2">
            <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 rounded-3xl blur-xl -inset-1 animate-pulse" />
            <div className="relative flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <span className="text-sm font-semibold text-red-200">
                {errorMsg}
              </span>
            </div>
          </div>
        )}

        {/* 🔥 PREMIUM SIGNUP BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className={`
            w-full relative group overflow-hidden rounded-3xl
            bg-gradient-to-r from-emerald-500/95 via-emerald-400/95 to-teal-500/95
            py-4 px-10 text-xl font-black text-slate-900 uppercase tracking-wider
            shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:shadow-[0_0_50px_rgba(16,185,129,0.9)]
            border-2 border-emerald-300/60 backdrop-blur-2xl
            hover:from-emerald-400 hover:to-teal-400 hover:scale-[1.05]
            active:scale-[0.98] active:shadow-[0_0_40px_rgba(16,185,129,0.8)]
            transition-all duration-400 ease-out
            
            disabled:from-slate-600/40 disabled:to-slate-500/40 
            disabled:shadow-slate-300/20 disabled:scale-100 
            disabled:cursor-not-allowed disabled:animate-pulse
            
            before:absolute before:inset-0 before:bg-gradient-to-r 
            before:from-white/30 before:to-emerald-200/20 
            before:-translate-x-full group-hover:translate-x-full
            before:transition-transform before:duration-700 before:ease-out
            
            after:absolute after:inset-0 after:bg-gradient-to-r
            after:from-emerald-600/20 after:to-transparent
            after:opacity-0 after:group-hover:opacity-100 after:transition-all after:duration-500
          `}
        >
          <span className="relative z-10 flex items-center justify-center gap-3">
            {loading ? (
              <>
                <div className="w-6 h-6 border-2.5 border-slate-900/80 border-t-transparent rounded-full animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <span className="text-2xl animate-bounce">✨</span>
                Create Account
              </>
            )}
          </span>

          {/* ✨ Floating Particles */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute top-3 left-4 w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce [animation-delay:0ms]" />
            <div className="absolute top-6 right-6 w-1 h-1 bg-white/50 rounded-full animate-ping [animation-delay:150ms]" />
            <div className="absolute bottom-3 left-6 w-2 h-2 bg-white/40 rounded-full animate-pulse [animation-delay:300ms]" />
          </div>
        </button>
      </form>

      {/* LOGIN LINK */}
      <div className="pt-8 border-t border-white/10">
        <p className="text-center text-sm text-white/60">
          Already have an account?{" "}
          <Link
            to="/login"
            className="group relative inline-flex items-center gap-1.5 font-semibold text-emerald-300 hover:text-emerald-200 transition-all duration-300"
          >
            Sign in here
            <span className="w-20 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 -mt-1 block" />
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Signup;
