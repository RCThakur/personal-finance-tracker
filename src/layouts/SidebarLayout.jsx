// src/layouts/SidebarLayout.jsx
import { Link, Outlet, useLocation } from "react-router-dom";

const SidebarLayout = () => {
  const location = useLocation();

  const navLinks = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/add", label: "Add Transaction" },
    { path: "/transactions", label: "All Transactions" },
    { path: "/reports", label: "Reports" },
  ];

  return (
    <div className="flex h-screen bg-black-100">
      <aside className="w-64 bg-black shadow-lg p-4">
        <h2 className="text-xl font-bold mb-6">💸 Finance Tracker</h2>
        <nav className="space-y-3">
          {navLinks.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`block px-4 py-2 rounded ${
                location.pathname === path ? "bg-blue-100 font-semibold" : "hover:bg-black-200"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default SidebarLayout;
