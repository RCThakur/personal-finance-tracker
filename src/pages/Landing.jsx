// src/pages/Landing.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

const Landing = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [activePricing, setActivePricing] = useState(0);

  const features = [
    {
      title: "Real-time Dashboard",
      desc: "Track income, expenses, budgets & goals with live updates across all devices.",
      icon: "📊",
    },
    {
      title: "Smart Budgets",
      desc: "Set monthly limits per category with automatic alerts when approaching limits.",
      icon: "💳",
    },
    {
      title: "Goal Tracker",
      desc: "Save for vacations, gadgets, or emergencies with visual progress tracking.",
      icon: "🎯",
    },
    {
      title: "Advanced Analytics",
      desc: "Spending trends, category breakdowns, and actionable financial insights.",
      icon: "📈",
    },
    {
      title: "Custom Categories",
      desc: "Create your own spending categories with custom colors and emojis.",
      icon: "🏷️",
    },
    {
      title: "Privacy First",
      desc: "Bank-grade encryption. Your data never leaves your device or trusted servers.",
      icon: "🔐",
    },
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Freelancer",
      quote:
        "Transformed my chaotic finances into clear goals. Saved ₹25K this year! ⭐⭐⭐⭐⭐",
      avatar: "P",
    },
    {
      name: "Rahul Patel",
      role: "Software Engineer",
      quote:
        "Best budgeting app I've used. Simple, beautiful, and actually works. ⭐⭐⭐⭐⭐",
      avatar: "R",
    },
    {
      name: "Anita Gupta",
      role: "Small Business Owner",
      quote:
        "The analytics helped me cut unnecessary expenses by 30%. Game changer! ⭐⭐⭐⭐⭐",
      avatar: "A",
    },
  ];

  return (
    <div className="min-h-screen min-w-screen flex flex-col bg-gradient-to-br from-slate-900 via-indigo-900/30 to-slate-950 text-white overflow-x-hidden">
      {/* HEADER BADGE */}
      <header className="w-full flex justify-center pt-6 px-4 z-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm backdrop-blur-xl shadow-xl animate-in fade-in duration-1000">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold">New</span>
          <span className="text-white/80">
            Smart insights for your monthly spending
          </span>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 lg:py-20">
        <div className="max-w-7xl w-full grid gap-12 lg:gap-20 lg:grid-cols-2 items-center">
          {/* HERO CONTENT */}
          <section className="space-y-8 lg:space-y-12">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight bg-gradient-to-r from-white via-emerald-50 to-white bg-clip-text text-transparent">
                Take control of your{" "}
                <span className="text-emerald-400">money</span>
                <br />
                <span className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl">
                  in minutes
                </span>{" "}
                💰
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-white/80 max-w-lg leading-relaxed">
                Track income and expenses, visualize spending patterns, set
                budgets, and hit savings goals with the
                <span className="font-semibold text-emerald-300">
                  {" "}
                  cleanest personal finance tracker
                </span>
                .
              </p>
            </div>

            {/* CTA BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/signup"
                className="group relative overflow-hidden inline-flex justify-center items-center px-8 py-4 rounded-3xl bg-gradient-to-r from-emerald-500/95 to-teal-500/95 text-xl font-black text-slate-900 shadow-[0_0_40px_rgba(16,185,129,0.6)] hover:shadow-[0_0_60px_rgba(16,185,129,0.9)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border border-emerald-300/50 backdrop-blur-xl"
              >
                <span className="relative z-10">🚀 Get Started Free</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Link>
              <Link
                to="/login"
                className="inline-flex justify-center items-center px-8 py-4 rounded-3xl border-2 border-white/30 text-xl font-semibold text-white hover:bg-white/10 hover:shadow-2xl hover:shadow-emerald-500/30 backdrop-blur-xl transition-all duration-300"
              >
                👤 Login
              </Link>
            </div>

            {/* SOCIAL PROOF */}
            <div className="flex flex-wrap items-center gap-6 text-sm lg:text-base text-white/70 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⭐⭐⭐⭐⭐</span>
                <span className="font-bold text-white">
                  4.9/5 (2,500+ users)
                </span>
              </div>
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-1">
                  <span className="text-emerald-400">🔒</span>
                  <span>Bank-grade encryption</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-emerald-400">🌐</span>
                  <span>Works offline</span>
                </span>
              </div>
            </div>
          </section>

          {/* HERO MOCKUP */}
          <section className="relative group mt-12 lg:mt-0">
            <div className="absolute -inset-12 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-3xl blur-3xl opacity-75 group-hover:opacity-100 transition-all duration-1000" />
            <div className="relative bg-white/5/70 backdrop-blur-3xl border border-white/15 rounded-3xl shadow-2xl p-8 lg:p-12 overflow-hidden">
              {/* Dashboard Mockup */}
              <div className="space-y-6">
                {/* Balance Card */}
                <div className="p-6 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-2xl border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-white/70">
                        Total Balance
                      </p>
                      <p className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-emerald-300 to-white bg-clip-text text-transparent mt-1">
                        ₹72,450
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-400/30 rounded-2xl flex items-center justify-center">
                      <span className="text-emerald-500 text-xl animate-pulse">
                        📈
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Income", value: "₹1.2L", color: "emerald" },
                    { label: "Expense", value: "₹89K", color: "red" },
                    { label: "Savings", value: "+₹32K", color: "blue" },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl bg-white/10 border border-white/20 text-center group-hover:scale-105 transition-transform`}
                    >
                      <p
                        className={`text-2xl font-black text-${stat.color}-400`}
                      >
                        {stat.value}
                      </p>
                      <p className="text-xs text-white/70 uppercase tracking-wide mt-1">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Mini Chart */}
                <div className="h-20 rounded-2xl bg-gradient-to-r from-slate-800/50 to-transparent border border-white/10 p-4 flex items-end gap-1 overflow-hidden">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-emerald-400/80 to-emerald-500/80 rounded-lg animate-slide-up"
                      style={{
                        height: `${40 + Math.sin(i) * 30}%`,
                        animationDelay: `${i * 100}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* FEATURES SECTION */}
      <section className="px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black bg-gradient-to-r from-white via-emerald-50 to-white bg-clip-text text-transparent mb-6">
              Everything you need to master your finances
            </h2>
            <p className="text-xl lg:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              From beginners to power users - we've got you covered with
              powerful tools and beautiful design.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`
                  group relative p-8 rounded-3xl bg-white/5 backdrop-blur-xl 
                  border border-white/10 hover:bg-white/10 hover:shadow-2xl 
                  hover:shadow-emerald-500/20 hover:-translate-y-2 transition-all duration-500
                  hover:border-emerald-400/50
                  ${
                    index === activeFeature
                      ? "ring-4 ring-emerald-400/30 scale-105 shadow-emerald-500/40"
                      : ""
                  }
                `}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
                <div className="relative z-10 space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-xl lg:text-2xl font-bold text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-white/80 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-4 pb-20 bg-white/3 backdrop-blur-xl border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-emerald-400 via-white to-emerald-400 bg-clip-text text-transparent mb-4">
              Loved by thousands of Indians
            </h2>
            <p className="text-xl text-white/80">Real users, real results</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="group p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-2 transition-all duration-500 cursor-pointer"
              >
                <div className="flex gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-emerald-300 text-sm font-semibold">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p className="text-white/90 leading-relaxed mb-6">
                  {testimonial.quote}
                </p>
                <div className="flex gap-1 text-emerald-300">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <span key={i} className="text-lg">
                        ⭐
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-white via-emerald-50 to-white bg-clip-text text-transparent mb-6">
            Simple pricing. No hidden fees.
          </h2>
          <p className="text-xl text-white/80 mb-16 max-w-2xl mx-auto">
            Start free. Upgrade anytime. Cancel instantly.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                title: "Free",
                price: "₹0",
                features: [
                  "Unlimited transactions",
                  "Basic analytics",
                  "3 budgets",
                  "1 goal",
                ],
                popular: false,
                cta: "Get Started",
              },
              {
                title: "Pro",
                price: "₹199/mo",
                features: [
                  "Everything in Free",
                  "Unlimited budgets & goals",
                  "Advanced analytics",
                  "PDF reports",
                  "Priority support",
                ],
                popular: true,
                cta: "Most Popular",
              },
              {
                title: "Family",
                price: "₹499/mo",
                features: [
                  "Everything in Pro",
                  "5 family accounts",
                  "Shared budgets",
                  "Team insights",
                ],
                popular: false,
                cta: "For Teams",
              },
            ].map((plan, index) => (
              <div
                key={plan.title}
                className={`
                  relative p-8 rounded-3xl border border-white/20 bg-white/5 backdrop-blur-xl
                  hover:shadow-2xl hover:shadow-emerald-500/30 hover:-translate-y-3
                  transition-all duration-500 group cursor-pointer
                  ${
                    plan.popular
                      ? "ring-4 ring-emerald-400/40 scale-105 shadow-emerald-500/50 border-emerald-400/50 bg-white/10"
                      : ""
                  }
                  ${
                    index === activePricing
                      ? "ring-4 ring-blue-400/30 shadow-blue-500/40"
                      : ""
                  }
                `}
                onMouseEnter={() => setActivePricing(index)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-slate-900 text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-4">
                  {plan.title}
                </h3>
                <div className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-6">
                  {plan.price}
                </div>
                <ul className="space-y-3 mb-8 text-white/80">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="text-emerald-400">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  className={`
                    block w-full py-4 rounded-2xl font-bold text-center transition-all duration-300
                    ${
                      plan.popular
                        ? "bg-emerald-500 text-slate-900 shadow-emerald-500/50 hover:shadow-emerald-600/70 hover:scale-[1.02]"
                        : "border-2 border-white/30 hover:bg-white/10"
                    }
                  `}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-4 pb-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-emerald-400 via-white to-emerald-400 bg-clip-text text-transparent mb-6">
            Ready to take control?
          </h2>
          <p className="text-xl text-white/80 mb-10 leading-relaxed">
            Join 2,500+ Indians mastering their finances today.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 text-2xl font-black text-slate-900 shadow-[0_0_50px_rgba(16,185,129,0.7)] hover:shadow-[0_0_70px_rgba(16,185,129,1)] hover:scale-[1.05] transition-all duration-500 border border-emerald-300/50 backdrop-blur-xl mx-auto block max-w-sm"
          >
            🚀 Start Free Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
