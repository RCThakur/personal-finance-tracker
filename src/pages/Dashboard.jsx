import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [incomeTotal, setIncomeTotal] = useState(0);
  const [expenseTotal, setExpenseTotal] = useState(0);

  useEffect(() => {
    const q = query(collection(db, "transactions"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(fetched);

      // Calculate totals
      let income = 0;
      let expense = 0;
      fetched.forEach((txn) => {
        if (txn.type === "income") {
          income += parseFloat(txn.amount);
        } else if (txn.type === "expense") {
          expense += parseFloat(txn.amount);
        }
      });
      setIncomeTotal(income);
      setExpenseTotal(expense);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📊 Dashboard Overview</h1>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Total Income</h2>
          <p className="text-2xl font-bold text-green-700">₹{incomeTotal}</p>
        </div>
        <div className="bg-red-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Total Expenses</h2>
          <p className="text-2xl font-bold text-red-700">₹{expenseTotal}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Net Balance</h2>
          <p className="text-2xl font-bold text-blue-700">₹{incomeTotal - expenseTotal}</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Recent Transactions</h2>
        <ul className="space-y-2">
          {transactions.slice(0, 5).map((txn) => (
            <li
              key={txn.id}
              className="border p-3 rounded shadow-sm flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{txn.description}</p>
                <small className="text-gray-500">{txn.date}</small>
              </div>
              <span
                className={`font-bold ${
                  txn.type === "income" ? "text-green-600" : "text-red-600"
                }`}
              >
                ₹{txn.amount}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
