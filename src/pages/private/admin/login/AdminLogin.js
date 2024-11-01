import React from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Ensure Bootstrap CSS is imported
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";

const AdminLogin = () => {
  const navigate = useNavigate();
  const handleAdminLogin = (e) => {
    e.preventDefault();
    navigate("/admin/dashboard");
  };

  return (
    <div className="container mt-5">
      <h2>Admin Access</h2>
      <p>Please login to access the admin.</p>
      <form onSubmit={handleAdminLogin} className="border p-4 rounded">
        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            Username
          </label>
          <input type="text" className="form-control" id="username" required />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Login
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
