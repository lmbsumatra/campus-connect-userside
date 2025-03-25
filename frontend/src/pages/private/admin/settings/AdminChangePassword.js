import React, { useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { baseApi } from "../../../../utils/consonants";

const AdminChangePassword = ({ onClose }) => {
  const { adminUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = (field) => {
    switch (field) {
      case "currentPassword":
        setShowCurrentPassword(!showCurrentPassword);
        break;
      case "newPassword":
        setShowNewPassword(!showNewPassword);
        break;
      case "confirmPassword":
        setShowConfirmPassword(!showConfirmPassword);
        break;
      default:
        break;
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    try {
      const response = await fetch(`${baseApi}/admin/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminUser.token}`,
        },
        body: JSON.stringify({
          admin_id: adminUser.id,
          role: adminUser.role,
          currentPassword,
          newPassword,
        }),
      });

      if (response.ok) {
        setSuccessMessage("Password changed successfully.");
        setTimeout(() => {
          onClose(); // Close modal after showing the success message
        }, 2000);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Failed to change password.");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setErrorMessage("An unexpected error occurred.");
    }
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-container">
        <div className="admin-modal-header">
          <div className="admin-modal-title">
            <i className="upload-icon">🔐</i>
            Change Password
          </div>
          <button className="admin-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="admin-modal-content">
          {(errorMessage || successMessage) && (
            <div
              className={`admin-modal-notification ${
                errorMessage ? "text-danger" : "text-success"
              }`}
            >
              {errorMessage || successMessage}
            </div>
          )}

          <div className="admin-modal-body">
            <form onSubmit={handleChangePassword}>
              <div className="account-details-card">
                <div className="card-header">Password Change</div>
                <div className="input-group">
                  <div className="input-wrapper">
                    <i className="input-icon">🔒</i>
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Current Password"
                      required
                    />
                    <button
                      type="button"
                      className="show-password-btn"
                      onClick={() =>
                        togglePasswordVisibility("currentPassword")
                      }
                    >
                      {showCurrentPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  <div className="input-wrapper">
                    <i className="input-icon">🔒</i>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New Password"
                      required
                    />
                    <button
                      type="button"
                      className="show-password-btn"
                      onClick={() => togglePasswordVisibility("newPassword")}
                    >
                      {showNewPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  <div className="input-wrapper">
                    <i className="input-icon">🔒</i>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm New Password"
                      required
                    />
                    <button
                      type="button"
                      className="show-password-btn"
                      onClick={() =>
                        togglePasswordVisibility("confirmPassword")
                      }
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="submit" className="add-admin-btn">
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChangePassword;
