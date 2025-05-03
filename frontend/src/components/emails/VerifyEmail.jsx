import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./verifyEmailStyles.css"; // Add custom styles here
import successIcon from "./success.svg";
import { baseApi } from "../../utils/consonants";

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const hasVerifiedRef = useRef(false); // Ref to track if verification has occurred

  // Effect hook to handle the email verification
  useEffect(() => {
    const verifyEmail = async () => {
      if (hasVerifiedRef.current) return; // Prevent double verification

      hasVerifiedRef.current = true; // Set flag to true
      try {
        const response = await fetch(
          `${baseApi}/user/verify-email/${encodeURIComponent(
            token
          )}`,
          { method: "GET" }
        );

        const responseData = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(
            responseData.message || "Your email has been successfully verified!"
          );
          startErrorCountdown("/"); // Start countdown for success
        } else {
          setStatus("error");
          setMessage(
            responseData.message || "Verification failed. Please try again."
          );
          startErrorCountdown("/"); // Start countdown for error
        }
      } catch (error) {
        console.error("Error during email verification:", error);
        setStatus("error");
        setMessage("An error occurred. Please try again later.");
        startErrorCountdown("/");
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate]); // Only depend on 'token'

  // Countdown logic for redirecting on success or error
  const startErrorCountdown = (redirectPath) => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(redirectPath); // Redirect after countdown ends
          return 0;
        }
        return prev - 1;
      });
    }, 1000); // Countdown every second
  };

  return (
    <div className="verify-container">
      <div className={`verify-card ${status}`}>
        <div className="icon"></div>
        {status === "success" && (
          <img
            src={successIcon}
            style={{ width: "81px", height: "81px", paddingBottom: "16px" }}
          />
        )}
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
            Redirecting to {status === "success" ? "home" : "login"} page in{" "}
            {countdown} seconds...
          </p>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
