import React from "react";
import { useTransactions } from "../context/TransactionContext";

const TransactionList = ({ onEdit }) => {
  const { transactions, deleteTransaction } = useTransactions();

  return (
    <div className="bg-white rounded-xl p-4 shadow">
      <h2 className="text-lg font-semibold mb-2">All Transactions</h2>
      {transactions.length === 0 ? (
        <p className="text-gray-500">No transactions found.</p>
      ) : (
        <ul className="space-y-2">
          {transactions.map((tx) => (
            <li key={tx.id} className="flex justify-between items-center border p-2 rounded">
              <div>
                <p className="font-medium">{tx.name}</p>
                <p className="text-sm text-gray-500">{tx.type} - ₹{tx.amount}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(tx)}
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTransaction(tx.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TransactionList;
