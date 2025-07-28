// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { TransactionProvider } from "./context/TransactionContext";

import SidebarLayout from "./layouts/SidebarLayout";
import Dashboard from "./pages/Dashboard";
import AddTransaction from "./pages/AddTransaction";
import AllTransactions from "./pages/AllTransactions";
import Reports from "./pages/Reports";
import Login from "./pages/Login";

function App() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <Router>
          <Routes>
            {/* Login route - outside the sidebar */}
            <Route path="/login" element={<Login />} />

            {/* Sidebar layout for authenticated pages */}
            <Route path="/" element={<SidebarLayout />}>
              <Route index element={<Navigate to="dashboard" />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="add" element={<AddTransaction />} />
              <Route path="transactions" element={<AllTransactions />} />
              <Route path="reports" element={<Reports />} />
            </Route>
          </Routes>
        </Router>
      </TransactionProvider>
    </AuthProvider>
  );
}

export default App;
