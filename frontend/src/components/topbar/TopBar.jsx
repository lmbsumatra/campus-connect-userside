import React, { useState } from "react";
import "./topBarStyles.css";
import ShowAlert from "../../utils/ShowAlert";
import { useDispatch } from "react-redux";

const TopBar = ({ isVerified, user }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();

  const handleResendVerification = async (event) => {
    ShowAlert(dispatch, "loading", "Loading");
    event.preventDefault();
    setIsLoading(true);
    setMessage("");
  
    try {
      const response = await fetch("http://localhost:3001/user/verify-email/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email }), // Ensure email is passed
      });
  
      if (response.ok) {
        ShowAlert(
          dispatch,
          "success",
          "Success!",
          "Verification email has been resent!"
        );
      } else {
        ShowAlert(
          dispatch,
          "error",
          "Error!",
          "Failed to resend verification email. Please try again."
        );
      }
    } catch (error) {
      ShowAlert(dispatch, "error", "Error!", error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  

  if (isVerified) return null;

  return (
    <div className="top-bar-notification">
      <p>
        Your email is not verified.{" "}
        <a href="#" onClick={handleResendVerification}>
          {isLoading
            ? "Resending..."
            : "Click here to resend verification email."}
        </a>
      </p>
      {message && <p className="notification-message">{message}</p>}
    </div>
  );
};

export default TopBar;
