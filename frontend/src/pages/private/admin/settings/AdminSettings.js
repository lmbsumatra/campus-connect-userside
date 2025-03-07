import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./adminSettingStyles.css";
import PasswordMeter from "../../../../components/common/PasswordMeter";
import { useAuth } from "../../../../context/AuthContext";
import AdminChangePassword from "./AdminChangePassword";
import AdminViewAccounts from "./AdminViewAccounts"; // Import the new component
import AdminUnavailableDates from "./AdminUnavailableDates";
import AdminResetStatus from "./AdminResetStatus";
import AdminViewSystemConfig from "./AdminViewSystemConfig";

const AdminSettings = ({ tab, onClose }) => {
  const navigate = useNavigate();
  const { adminUser } = useAuth(); // Get the adminUser from context
  const [showCreateAcctWindow, setShowCreateAcctWindow] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);

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
      const response = await fetch("http://localhost:3001/admin/register", {
        method: "POST",
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
        <button
          className="btn btn-secondary mb-2"
          onClick={() => setShowAccounts(!showAccounts)}
        >
          {showAccounts ? "Hide Accounts" : "View Admin Accounts"}
        </button>
        {showAccounts && <AdminViewAccounts />}

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
          <div className="modal show bg-shadow" style={{ display: "block" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" ref={errorRef}>
                    Create Admin Account
                  </h5>
                  <button
                    type="button"
                    className="close"
                    onClick={() => setShowCreateAcctWindow(false)}
                  >
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <form>
                    <span
                      className={`${
                        errorMessage ? "text-danger" : "text-secondary"
                      }`}
                    >
                      {errorMessage
                        ? errorMessage
                        : "Please complete all required fields to register."}
                    </span>

                    {/* Profile Picture Upload Box */}
                    <div className="form-group">
                      <label>Profile Picture:</label>
                      <div
                        className="border border-dashed rounded p-3 text-center"
                        style={{
                          cursor: "pointer",
                          width: "200px",
                          maxHeight: "200px",
                        }}
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
                            style={{
                              width: "100%",
                              maxHeight: "200px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <p>Drag and drop an image here, or click to upload</p>
                        )}
                        <input
                          type="file"
                          id="file-input"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>

                    {/* User Input Fields */}
                    <section className="personal-details bordered-section">
                      <p>Personal Details</p>
                      <label>Input your complete name</label>
                      <div className="input-group">
                        <input
                          type="text"
                          name="firstName"
                          value={userData.firstName}
                          onChange={handleChange}
                          placeholder="First name"
                          className="form-control"
                          required
                        />
                        <input
                          type="text"
                          name="middleName"
                          value={userData.middleName}
                          onChange={handleChange}
                          placeholder="Middle name (optional)"
                          className="form-control"
                        />
                        <input
                          type="text"
                          name="lastName"
                          value={userData.lastName}
                          onChange={handleChange}
                          placeholder="Last name"
                          className="form-control"
                          required
                        />
                      </div>
                    </section>

                    {/* Account Details */}
                    <section className="account-details bordered-section">
                      <p>Account Details</p>
                      <div className="input-group">
                        <span className="input-group-text">Email</span>
                        <input
                          type="email"
                          name="email"
                          value={userData.email}
                          onChange={handleChange}
                          className="form-control"
                          required
                        />
                      </div>
                      <div className="input-group">
                        <span className="input-group-text">Password</span>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={userData.password}
                          onChange={handleChange}
                          className="form-control"
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => togglePasswordVisibility("password")}
                        >
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                      {userData.password && (
                        <PasswordMeter password={userData.password} />
                      )}
                      <div className="input-group">
                        <span className="input-group-text">
                          Confirm Password
                        </span>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={userData.confirmPassword}
                          onChange={handleChange}
                          className="form-control"
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() =>
                            togglePasswordVisibility("confirmPassword")
                          }
                        >
                          {showConfirmPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                    </section>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="btn btn-success"
                      onClick={handleRegisterSubmit}
                    >
                      Add Admin
                    </button>
                  </form>
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
