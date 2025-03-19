import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");

  // User data state
  const [userData, setUserData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    middleName: "",
    tupId: "",
    confirmPassword: "",
  });

  // State to manage triggers for inputs
  const [inputTriggers, setInputTriggers] = useState({
    email: false,
    password: false,
    firstName: false,
    lastName: false,
    middleName: false,
    tupId: false,
    confirmPassword: false,
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
        // console.log("Login Response Data:", data); // Log the full response

        const { token, refreshToken, role, userId, first_name, last_name } =
          data; // Destructure the fields
        loginAdmin(token, refreshToken, role, userId, first_name, last_name); // Pass refreshToken to loginAdmin
        navigate("/admin/dashboard"); // Redirect after successful login
      } else {
        const errorData = await response.json();
        console.error("Login failed:", errorData);
        setErrorMessage(errorData.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setErrorMessage("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Admin Access</h2>
      <p>Please login to access the admin.</p>
      <form onSubmit={handleAdminLogin} className="border p-4 rounded">
        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            Email
          </label>
          <input
            type="text"
            name="email"
            className="form-control"
            id="username"
            value={userData.email}
            onChange={handleChange}
            onBlur={() => handleBlur("email")}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={userData.password}
            onChange={handlePasswordChange}
            onBlur={() => handleBlur("password")}
            className="form-control"
            id="password"
            required
          />
        </div>
        {errorMessage && <p className="text-danger">{errorMessage}</p>}
        <button
          type="submit"
          className="btn btn-primary"
          onClick={handleAdminLogin}
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
