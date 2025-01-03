import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./verifyEmailStyles.css";

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/user/verify-email/${token}`,
          { method: "GET" }
        );

        if (response.ok) {
          setStatus("success");
          setMessage("Your email has been successfully verified!");
          setTimeout(() => navigate("/login"), 3000);
        } else {
          const error = await response.json();
          setStatus("error");
          setMessage(error.message || "Verification failed. Please try again.");
          startErrorCountdown();
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred. Please try again later.");
        startErrorCountdown();
      }
    };

    verifyEmail();
  }, [token, navigate]);

  const startErrorCountdown = () => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="verify-container">
      <div className={`verify-card ${status}`}>
        <div className="icon"></div>
        <h1>
          {status === "loading"
            ? "Verifying your email..."
            : status === "success"
            ? "Success!"
            : "Error"}
        </h1>
        <p>{message}</p>
        {(status === "success" || status === "error") && (
          <p className="redirect-text">
            Redirecting to login page in{" "}
            {status === "success" ? "3" : countdown} seconds...
          </p>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
