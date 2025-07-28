import { useTransactions } from "../context/TransactionContext";

const SummaryCard = () => {
  const { transactions } = useTransactions();

  const income = transactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const expenses = transactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const balance = income - expenses;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="bg-green-100 text-green-800 p-4 rounded shadow">
        <h3 className="font-semibold text-sm">Income</h3>
        <p className="text-xl font-bold">₹{income.toFixed(2)}</p>
      </div>
      <div className="bg-red-100 text-red-800 p-4 rounded shadow">
        <h3 className="font-semibold text-sm">Expenses</h3>
        <p className="text-xl font-bold">₹{expenses.toFixed(2)}</p>
      </div>
      <div className="bg-blue-100 text-blue-800 p-4 rounded shadow">
        <h3 className="font-semibold text-sm">Balance</h3>
        <p className="text-xl font-bold">₹{balance.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default SummaryCard;
