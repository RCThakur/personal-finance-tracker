# 💰 Personal Finance Tracker Dashboard

A modern, responsive **Personal Finance Tracker** built with **React, Firebase, Tailwind CSS, and Recharts**.  
Track income & expenses in real-time, visualize spending patterns, and manage your finances efficiently.

---

## 🚀 Features

- 🔐 **Authentication**

  - Email & Password login (Firebase Auth)
  - User-specific data isolation

- 💸 **Transaction Management**

  - Add income & expense transactions
  - Categorize transactions (Food, Transport, Bills, etc.)
  - Delete transactions securely
  - Real-time updates using Firestore listeners

- 📊 **Analytics Dashboard**

  - Total balance, income & expenses
  - Savings rate calculation
  - Category-wise expense breakdown (Pie Chart)
  - Monthly income vs expense trends (Bar Chart)

- ⚡ **Real-Time Sync**

  - Firestore `onSnapshot` for live updates
  - Instant UI refresh without reload

- 🎨 **Modern UI**
  - Tailwind CSS (Glassmorphism style)
  - Fully responsive layout
  - Smooth animations & hover effects

---

## 🛠️ Tech Stack

| Tech             | Usage              |
| ---------------- | ------------------ |
| **React**        | UI Components      |
| **Vite**         | Fast bundler setup |
| **Firebase**     | Auth & Firestore   |
| **Recharts**     | Data Visualization |
| **CSS Modules**  | Scoped styling     |
| **React Router** | Page navigation    |

---

## 📁 Project Structure

```text
src/
├── components/                    # Reusable UI & layout components
│   ├── AuthLayout.jsx             # Layout wrapper for auth pages (login/signup)
│   ├── Layout.jsx                 # Main app layout (Navbar + Sidebar)
│   └── ProtectedRoute.jsx         # Route guard for authenticated pages
│
├── context/                       # Global state management
│   └── AuthContext.jsx            # Firebase authentication context
│
├── pages/                         # Application pages (routes)
│   ├── Landing.jsx                # Conversion-optimized landing page
│   ├── Login.jsx                  # Premium animated login page
│   ├── Signup.jsx                 # Premium animated signup page
│   │
│   ├── DashboardHome.jsx          # Main dashboard (stats + live charts)
│   ├── Analytics.jsx              # Advanced analytics with time filters
│   ├── Budgets.jsx                # Budget creation & live tracking
│   ├── Goals.jsx                  # Financial goals & progress tracking
│   ├── Categories.jsx             # Custom income/expense categories (CRUD)
│   ├── Reports.jsx                # Reports & PDF/CSV export
│   └── Profile.jsx                # User profile, preferences & stats
│
├── firebase.js                    # Firebase configuration & initialization
├── App.jsx                        # App routes & layout binding
└── main.jsx                       # React entry point (Vite)

```
