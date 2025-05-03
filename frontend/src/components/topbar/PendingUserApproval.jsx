import React, { useEffect } from "react";
import "./topBarStyles.css";
import { Link } from "react-router-dom";

const formatRestrictionDate = (dateString) => {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    console.error("Error formatting date:", e);
    return "Invalid Date";
  }
};

const extractDateFromStatusMsg = (statusMsg) => {
  if (!statusMsg) return null;

  // Match patterns like "Account restricted until 4/2/2025, 2:43:03 AM"
  const dateMatch = statusMsg.match(/restricted until ([^\.]+)/i);
  if (dateMatch && dateMatch[1]) {
    try {
      const parsedDate = new Date(dateMatch[1].trim());
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString();
      }
    } catch (e) {
      console.error("Failed to parse date from statusMsg:", e);
    }
  }
  return null;
};

const PendingUserApproval = ({ isVerified, user }) => {
  let statusMessage = "";
  let className = "";
  const studentData = user?.student;
  const statusReason = studentData?.statusMsg || "";
  let restrictionEndDate =
    studentData?.restrictedUntil || extractDateFromStatusMsg(statusReason);

  // // Enhanced debug logs
  // console.log("===== RESTRICTION DEBUG =====");
  // console.log("User Status:", isVerified);
  // console.log("Student data:", studentData);
  // console.log("Direct restriction End Date:", studentData?.restrictedUntil);
  // console.log("Status Message:", statusReason);
  // console.log("Extracted restriction date:", restrictionEndDate);
  // console.log("Current date (client):", new Date().toISOString());

  if (restrictionEndDate) {
    const restrictionDate = new Date(restrictionEndDate);
    // console.log(
    //   "Restriction End Date (parsed):",
    //   restrictionDate.toISOString()
    // );
    // console.log("Is date valid?", !isNaN(restrictionDate.getTime()));
    // console.log(
    //   "Time difference (ms):",
    //   restrictionDate.getTime() - Date.now()
    // );
    // console.log("Is restriction still active?", restrictionDate > new Date());
  }

  // Calculate if CURRENTLY restricted
  const isCurrentlyActiveRestriction =
    isVerified === "restricted" &&
    restrictionEndDate &&
    new Date(restrictionEndDate) > new Date();

  // console.log(
  //   "Final active restriction check result:",
  //   isCurrentlyActiveRestriction
  // );

  useEffect(() => {
    // This will run once when the component mounts
    if (isVerified === "restricted" && restrictionEndDate) {
      // console.log("TIMEZONE CHECK:");
      // console.log(
      //   "Browser timezone:",
      //   Intl.DateTimeFormat().resolvedOptions().timeZone
      // );
      // console.log("Local string representation:", new Date().toString());
      // console.log("UTC string:", new Date().toUTCString());
    }
  }, [isVerified, restrictionEndDate]);

  // Handle missing date despite restricted status
  if (isVerified === "restricted" && !restrictionEndDate) {
    // console.log("WARNING: User is restricted but has no restriction end date");
    statusMessage = (
      <>
        Your account is currently restricted. Please contact support for
        details.
      </>
    );
    className = "restricted";
    return (
      <div className={`pending-topbar-notification ${className}`}>
        <p>{statusMessage}</p>
      </div>
    );
  }

  if (isVerified === "pending") {
    statusMessage = "Your account is under review. Please wait for approval.";
    className = "pending";
  }
  // --- Handle Restricted Status ---
  else if (isVerified === "restricted") {
    if (isCurrentlyActiveRestriction) {
      // Get reason without the date portion for cleaner display
      let cleanReason = statusReason;
      if (statusReason.includes("Account restricted until")) {
        cleanReason = statusReason.replace(
          /Account restricted until [^\.]+\.\s*/i,
          ""
        );
      }

      statusMessage = (
        <>
          Your account is temporarily restricted until{" "}
          <strong>{formatRestrictionDate(restrictionEndDate)}</strong>. Please
          contact support if you have questions.
          <Link to="/profile/edit-profile">Go to profile</Link>
        </>
      );
      className = "restricted";
    } else {
      // console.log("SHOWING EXPIRED RESTRICTION MESSAGE DESPITE FUTURE DATE");

      statusMessage = (
        <>
          A previous restriction on your account has expired, but your account
          requires attention.{" "}
          {statusReason &&
            `Details: ${statusReason.substring(0, 100)}${
              statusReason.length > 100 ? "..." : ""
            }. `}
          Please review your profile or contact support.{" "}
          <Link to="/profile/edit-profile">Go to profile</Link>
        </>
      );
      className = "flagged";
    }
  } else if (isVerified === "flagged") {
    statusMessage = (
      <>
        Your account requires attention (e.g., verification issue).{" "}
        {statusReason &&
          `Details: ${statusReason.substring(0, 100)}${
            statusReason.length > 100 ? "..." : ""
          }. `}
        Please review your profile or contact support.{" "}
        <Link to="/profile/edit-profile">Go to profile</Link>
      </>
    );
    className = "flagged";
  } else if (isVerified === "banned") {
    statusMessage = (
      <>
        Your account has been permanently banned.{" "}
        {statusReason &&
          `Reason: ${statusReason.substring(0, 150)}${
            statusReason.length > 150 ? "..." : ""
          }. `}
        Please contact support for inquiries.
      </>
    );
    className = "banned";
  } else if (isVerified === "verified") {
    return null;
  } else {
    statusMessage = `Your account status ('${isVerified}') is unrecognized. Please contact support.`;
    className = "unknown";
  }

  if (!statusMessage) {
    return null;
  }

  return (
    <div className={`pending-topbar-notification ${className}`}>
      <p>{statusMessage}</p>
    </div>
  );
};

export default PendingUserApproval;
