import React from 'react';
import './transactionStyles.css';

const TransactionsTable = () => {
  const transactions = [
    {
      date: "July 11, 2024",
      transaction: "Payment",
      paymentMethod: "Gcash",
      amount: "100.00"
    },
    {
      date: "July 12, 2024",
      transaction: "Payment",
      paymentMethod: "Gcash",
      amount: "50.00"
    },
    {
      date: "July 13, 2024",
      transaction: "Payment",
      paymentMethod: "Gcash",
      amount: "150.00"
    }
  ];

  return (
    <div className="transactions-table-container">
    <h3>Transactions</h3>
      <table className="transactions-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Transaction</th>
            <th>Payment Method</th>
            <th>Amount</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, index) => (
            <tr key={index}>
              <td>{transaction.date}</td>
              <td>{transaction.transaction}</td>
              <td>{transaction.paymentMethod}</td>
              <td>{transaction.amount}</td>
              <td>
                <button className="table-edit-btn">View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionsTable;
