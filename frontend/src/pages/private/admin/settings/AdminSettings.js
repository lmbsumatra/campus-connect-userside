import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./adminSettingStyles.css";
import PasswordMeter from "../../../../components/common/PasswordMeter";
import { useAuth } from "../../../../context/AuthContext";
import AdminChangePassword from "./AdminChangePassword";
import AdminViewAccounts from "./AdminViewAccounts";
import AdminUnavailableDates from "./AdminUnavailableDates";
import AdminResetStatus from "./AdminResetStatus";
import AdminViewSystemConfig from "./AdminViewSystemConfig";
import { baseApi } from "../../../../utils/consonants";

const AdminSettings = ({ tab, onClose }) => {
  const navigate = useNavigate();
  const { adminUser } = useAuth();
  const [showCreateAcctWindow, setShowCreateAcctWindow] = useState(false);
  const [showAdminAccounts, setShowAdminAccounts] = useState(false);

  const [uploadedImage, setUploadedImage] = useState(null);
  const [authTab, setAuthTab] = useState(tab);
  const [imageTouched, setImageTouched] = useState(false);
  const [inputWarning, setInputWarning] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const errorRef = useRef(null);
  const [showManageDates, setShowManageDates] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showManageEndSemesterDates, setShowManageEndSemesterDates] =
    useState(false);

  const [showSystemConfig, setShowSystemConfig] = useState(false);

  // User data state
  const [userData, setUserData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    middleName: "",
    confirmPassword: "",
  });

  const [inputTriggers, setInputTriggers] = useState({
    email: false,
    password: false,
    firstName: false,
    lastName: false,
    middleName: false,
    confirmPassword: false,
  });

  useEffect(() => {
    setAuthTab(tab);
  }, [tab]);

  const handleTabClick = (tab) => {
    setAuthTab(tab);
    resetForm();
    setErrorMessage();
    setImageTouched(false);
  };

  const resetForm = () => {
    setUploadedImage(null);
    setUserData({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      middleName: "",
      confirmPassword: "",
    });
    setInputTriggers({
      email: false,
      password: false,
      firstName: false,
      lastName: false,
      confirmPassword: false,
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedImage(file); // Keep the file object
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setUploadedImage(file); // Keep the file object
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (
      !userData.firstName ||
      !userData.lastName ||
      !userData.email ||
      !userData.password ||
      !userData.confirmPassword ||
      !uploadedImage
    ) {
      setErrorMessage("Please fill in all required fields.");
      errorRef.current.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (userData.password !== userData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      errorRef.current.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const formData = new FormData();
    formData.append("first_name", userData.firstName);
    formData.append("middle_name", userData.middleName);
    formData.append("last_name", userData.lastName);
    formData.append("email", userData.email);
    formData.append("password", userData.password);
    formData.append("profile_pic", uploadedImage);
    formData.append("role", "Admin");

    // Log FormData entries for debugging
    for (const [key, value] of formData.entries()) {
      // console.log(`${key}: ${value}`);
    }

    try {
      const response = await fetch(`${baseApi}/admin/register`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminUser.token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        alert("Registered Successfully");

        // Reset the form and close the modal
        resetForm();
        setShowCreateAcctWindow(false);
      } else {
        const errorData = await response.json();
        console.error("Registration failed:", errorData);
        setErrorMessage(
          errorData.message || "Registration failed. Please try again."
        );
        errorRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrorMessage("An unexpected error occurred. Please try again later.");
      errorRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const [showChangePassword, setShowChangePassword] = useState(false); //change pass

  const togglePasswordVisibility = (field) => {
    if (field === "password") {
      setShowPassword((prevState) => !prevState);
    } else if (field === "confirmPassword") {
      setShowConfirmPassword((prevState) => !prevState);
    }
  };

  return (
    <div className="admin-content-container">
      <div className="admin content">
        {/* Modal for Admin Accounts */}
        <AdminViewAccounts
          show={showAdminAccounts}
          onClose={() => setShowAdminAccounts(false)}
        />

        {/* Changing password for Admin/SuperAdmin */}
        <div>
          <button
            className="btn btn-secondary mb-2"
            onClick={() => setShowChangePassword(true)}
          >
            Change Password
          </button>

          {showChangePassword && (
            <AdminChangePassword onClose={() => setShowChangePassword(false)} />
          )}
        </div>

        {/* Conditionally render the Create Account button based on user role */}
        {adminUser?.role === "superadmin" && ( // Check if the user is superadmin
          <button
            className="btn btn-primary mt-2"
            onClick={() => setShowCreateAcctWindow(!showCreateAcctWindow)}
          >
            Create Account
          </button>
        )}

        {/* Manage to add unavailable dates*/}
        <div>
          {adminUser?.role === "superadmin" && (
            <button
              className="btn btn-warning mt-2"
              onClick={() => setShowManageDates(true)}
            >
              Manage Unavailable Dates
            </button>
          )}
          {showManageDates && (
            <AdminUnavailableDates onClose={() => setShowManageDates(false)} />
          )}
        </div>

        <div>
          {adminUser?.role === "superadmin" && (
            <button
              className="btn btn-info mt-2"
              onClick={() => setShowManageEndSemesterDates(true)}
            >
              Manage End Semester Dates
            </button>
          )}

          {showManageEndSemesterDates && (
            <AdminResetStatus
              onClose={() => setShowManageEndSemesterDates(false)}
            />
          )}
        </div>

        {showCreateAcctWindow && (
          <div className="admin1-modal-overlay">
            <div className="admin1-modal-container">
              <div className="admin1-modal-header">
                <div className="admin1-modal-title">
                  <i className="upload1-icon">👥</i>
                  Create Admin Account
                </div>
                <button
                  className="admin1-modal-close"
                  onClick={() => setShowCreateAcctWindow(false)}
                >
                  ✕
                </button>
              </div>

              <div className="admin1-modal-content">
                <div className="admin1-modal-notification">
                  Please complete all required fields to register.
                </div>

                <div className="admin1-modal-body">
                  <div className="profile1-upload-section">
                    <div
                      className="profile1-upload-box"
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={() =>
                        document.getElementById("file-input").click()
                      }
                    >
                      {uploadedImage ? (
                        <img
                          src={URL.createObjectURL(uploadedImage)}
                          alt="Profile Preview"
                          className="profile1-preview-image"
                        />
                      ) : (
                        <>
                          <i className="upload1-icon">⬆️</i>
                          <span>
                            Drag and drop an image here,
                            <br /> or click to upload
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        id="file-input"
                        accept="image/*"
                        className="file1-input-hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>

                  <div className="details1-section">
                    <div className="personal1-details-card">
                      <div className="card1-header">Personal Details</div>
                      <div className="input1-row">
                        <input
                          type="text"
                          name="firstName"
                          value={userData.firstName}
                          onChange={handleChange}
                          placeholder="First name"
                          required
                        />
                        <input
                          type="text"
                          name="middleName"
                          value={userData.middleName}
                          onChange={handleChange}
                          placeholder="Middle name"
                        />
                        <input
                          type="text"
                          name="lastName"
                          value={userData.lastName}
                          onChange={handleChange}
                          placeholder="Last name"
                          required
                        />
                      </div>
                    </div>

                    <div className="account1-details-card">
                      <div className="card1-header">Account Details</div>
                      <div className="input1-group">
                        <div className="input1-wrapper">
                          <i className="input1-icon">✉️</i>
                          <input
                            type="email"
                            name="email"
                            value={userData.email}
                            onChange={handleChange}
                            placeholder="Email Address"
                            required
                          />
                        </div>
                        <div className="input1-wrapper">
                          <i className="input1-icon">🔒</i>
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={userData.password}
                            onChange={handleChange}
                            placeholder="Password"
                            required
                          />
                          <button
                            className="show1-password-btn"
                            onClick={() => togglePasswordVisibility("password")}
                          >
                            {showPassword ? "Hide" : "Show"}
                          </button>
                        </div>
                        {userData.password && (
                          <PasswordMeter password={userData.password} />
                        )}
                        <div className="input1-wrapper">
                          <i className="input1-icon">🔒</i>
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={userData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm Password"
                            required
                          />
                          <button
                            className="show1-password-btn"
                            onClick={() =>
                              togglePasswordVisibility("confirmPassword")
                            }
                          >
                            {showConfirmPassword ? "Hide" : "Show"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="admin1-modal-footer">
                  <button
                    className="add1-admin-btn"
                    onClick={handleRegisterSubmit}
                  >
                    Add Admin
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* system config update: stripe(enable, disable) */}
        <div>
          <button
            className="btn btn-secondary mb-2"
            onClick={() => setShowSystemConfig(true)}
          >
            View System Configuration
          </button>

          {showSystemConfig && (
            <AdminViewSystemConfig
              show={showSystemConfig}
              onClose={() => setShowSystemConfig(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
