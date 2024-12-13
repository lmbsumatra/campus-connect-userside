import React, { useState, useEffect } from "react";

const AdminViewAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch("http://localhost:3001/admin/accounts"); // Adjust URL to your backend endpoint
        if (!response.ok) {
          throw new Error("Failed to fetch accounts");
        }
        const data = await response.json();
        setAccounts(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchAccounts();
  }, []);

  return (
    <div className="admin-accounts-list">
      <h3>Admin Accounts</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      <table className="table">
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((account) => (
            <tr key={account.user_id}>
              <td>{account.first_name}</td>
              <td>{account.last_name}</td>
              <td>{account.email}</td>
              <td>{account.role}</td>
              <td>{new Date(account.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminViewAccounts;
