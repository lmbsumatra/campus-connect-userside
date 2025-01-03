import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const VerifyEmail = () => {
  const { token } = useParams(); 
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  console.log(token);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/user/verify-email/${token}`,
          {
            method: "GET",
          }
        );

        if (response.ok) {
          setStatus("success");
          setMessage("Your email has been successfully verified!");
          setTimeout(() => navigate("/login"), 3000); 
        } else {
          const error = await response.json();
          setStatus("error");
          setMessage(error.message || "Verification failed. Please try again.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred. Please try again later.");
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="verify-email-container">
      {status === "success" ? (
        <div className="success-message">
          <h1>{message}</h1>
          <p>You will be redirected to the login page shortly.</p>
        </div>
      ) : (
        <div className="error-message">
          <h1>{message}</h1>
        </div>
      )}
    </div>
  );
};

export default VerifyEmail;
