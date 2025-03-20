import React, { useState } from "react";
import "./topBarStyles.css";
import { useDispatch } from "react-redux";

const PendingUserApproval = ({ isVerified, user }) => {
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();

  let statusMessage = "";
  if (isVerified === "pending") {
    statusMessage = "Your account is under review. Please wait for approval.";
  } else if (isVerified === "approved" || isVerified === "verified") {
    return null; // Hide the notification if approved
  } else if (isVerified === "flagged") {
    statusMessage = (
      <>
        Your verification was flagged. Please update your documents and try
        again. <a href="/profile/edit-profile">Go to profile</a>
      </>
    );
  } else {
    statusMessage =
      "Your verification status is unknown. Please contact support.";
  }

  return (
    <div className={`pending-topbar-notification ${isVerified}`}>
      <p>{statusMessage}</p>
      {message && <p className="notification-message">{message}</p>}
    </div>
  );
};

export default PendingUserApproval;
