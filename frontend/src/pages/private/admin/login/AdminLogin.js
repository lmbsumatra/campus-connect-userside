import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import "./adminLoginStyles.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // User data state
  const [userData, setUserData] = useState({
    email: "",
    password: "",
  });

  // State to manage triggers for inputs
  const [inputTriggers, setInputTriggers] = useState({
    email: false,
    password: false,
  });

  const handlePasswordChange = (e) => {
    const { value } = e.target;
    setUserData((prevData) => ({ ...prevData, password: value }));
    setInputTriggers((prev) => ({ ...prev, password: false }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleBlur = (field) => {
    setInputTriggers((prev) => ({ ...prev, [field]: !userData[field] }));
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3001/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const { token, refreshToken, role, userId, first_name, last_name } =
          data;
        loginAdmin(token, refreshToken, role, userId, first_name, last_name);
        navigate("/admin/dashboard");
      } else {
        const errorData = await response.json();
        console.error("Login failed:", errorData);
        setErrorMessage(errorData.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setErrorMessage("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2 className="text-center mb-4">Admin Portal</h2>
          <div className="login-divider"></div>
        </div>

        <form onSubmit={handleAdminLogin}>
          <div className="mb-4">
            <label htmlFor="username" className="form-label">
              Email Address
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="email"
                name="email"
                className={`form-control ${
                  inputTriggers.email ? "is-invalid" : ""
                }`}
                id="username"
                value={userData.email}
                onChange={handleChange}
                onBlur={() => handleBlur("email")}
                placeholder="admin@example.com"
                required
              />
            </div>
            {inputTriggers.email && (
              <div className="invalid-feedback d-block">Email is required</div>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-lock"></i>
              </span>
              <input
                type="password"
                name="password"
                value={userData.password}
                onChange={handlePasswordChange}
                onBlur={() => handleBlur("password")}
                className={`form-control ${
                  inputTriggers.password ? "is-invalid" : ""
                }`}
                id="password"
                placeholder="Enter your password"
                required
              />
            </div>
            {inputTriggers.password && (
              <div className="invalid-feedback d-block">
                Password is required
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="alert alert-danger" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100 login-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Logging in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
