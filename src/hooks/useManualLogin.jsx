import { useState } from "react";
import { useNavigate } from "react-router-dom";

const useManualLogin = (loginDataState, loginStudent) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Reset any previous error messages
    setLoading(true);

    // Initialize an AbortController for a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout

    try {
      const response = await fetch("http://localhost:3001/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginDataState.email.value,
          password: loginDataState.password.value,
        }),
        signal: controller.signal, // Attach the abort controller's signal
      });

      // Handle non-2xx HTTP status codes
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          setError("Invalid email or password.");
        } else if (response.status === 500) {
          setError("Server error. Please try again later.");
        } else {
          setError(errorData.message || "Login failed. Please try again.");
        }
        return;
      }

      // Parse the response data
      const data = await response.json();
      if (data.token && data.role && data.userId) {
        loginStudent(data.token, data.role, data.userId);
        navigate("/"); // Navigate to the homepage after successful login
      } else {
        setError("Invalid response data. Please try again.");
      }
    } catch (error) {
      if (error.name === "AbortError") {
        setError("Login request timed out. Please try again.");
      } else if (error.message.includes("NetworkError")) {
        setError("Network error. Please check your connection.");
      } else {
        setError("An unexpected error occurred. Please try again later.");
      }
    } finally {
      clearTimeout(timeoutId); // Clear timeout
      setLoading(false);
    }
  };

  return {
    handleLogin,
    error,
    loading,
  };
};

export default useManualLogin;
