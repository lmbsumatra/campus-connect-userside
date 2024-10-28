import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./adminSettingStyles.css";
import PasswordMeter from "../../../../components/common/PasswordMeter";

const AdminSettings = ({ tab, onClose }) => {
  const navigate = useNavigate();
  const [showCreateAcctWindow, setShowCreateAcctWindow] = useState(false);
  
  const [uploadedImage, setUploadedImage] = useState(null);
  const [authTab, setAuthTab] = useState(tab);
  const [imageTouched, setImageTouched] = useState(false);
  const [inputWarning, setInputWarning] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const errorRef = useRef(null);

  // User data state
  const [userData, setUserData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    middleName: "",
    confirmPassword: "",
  });

  // State to manage triggers for inputs
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
      // middleName: false,
      confirmPassword: false,
    });
  };

  const handleImageUpload = (e, setImage) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result.split(",")[1]);
      reader.readAsDataURL(file);
    }
  };

   const handleImageClick = () => {
    setImageTouched(true);
    document.getElementById("uploadImageInput").click();
  };


  const handleCreateAccount = () => {
    setShowCreateAcctWindow(!showCreateAcctWindow);
    // Reset the image preview when the modal is closed
    setUploadedImage(null);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {

      setUploadedImage(URL.createObjectURL(file)); // Create a preview URL
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault(); // Prevent default behavior (Prevent file from being opened)
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setUploadedImage(URL.createObjectURL(file)); // Create a preview URL
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { value } = e.target;
    setUserData((prevData) => ({ ...prevData, password: value }));
    setInputTriggers((prev) => ({ ...prev, password: false }));
  };

  const handleBlur = (field) => {
    setInputTriggers((prev) => ({ ...prev, [field]: !userData[field] }));
  };

  const getBorderColor = (field) => (inputTriggers[field] ? "red" : "");

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
      setErrorMessage("Please fill in all required fields."); // Set error message for missing fields
      errorRef.current.scrollIntoView({ behavior: "smooth" }); // Scroll to error message
      return;
    }

    if (userData.password !== userData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      errorRef.current.scrollIntoView({ behavior: "smooth" }); // Scroll to error message
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

    try {
      const response = await fetch("http://localhost:3001/admin/register", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("User registered successfully:", data);
        alert("Registered Successfully");
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
  

  return (
    <div className="admin-content-container">
      <div className="admin content">
        <button className="btn btn-primary" onClick={handleCreateAccount}>
          Create Account
        </button>

        {showCreateAcctWindow && (
          <div className="modal show overlay" style={{ display: "block" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" ref={errorRef}>Create Admin Account</h5>
                  <button
                    type="button"
                    className="close"
                    onClick={handleCreateAccount}
                  >
                    <span>&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <form>
                  <span
                className={`${errorMessage ? "text-danger" : "text-secondary"}`}
              >
                {errorMessage
                  ? errorMessage
                  : "Please complete all required fields to register."}
              </span>

                    {/* Full Name */}
                <section className="personal-details bordered-section">
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
                            src={uploadedImage}
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
                <p>Personal Details</p>
                <label>Input your complete name</label>
                <div className="input-group">
                  <input
                    type="text"
                    name="firstName"
                    value={userData.firstName}
                    onChange={handleChange}
                    onBlur={() => handleBlur("firstName")}
                    placeholder="First name"
                    className="form-control"
                    style={{ borderColor: getBorderColor("firstName") }}
                    required
                  />
                  <input
                    type="text"
                    name="middleName"
                    value={userData.middleName}
                    onChange={handleChange}
                    // onBlur={() => handleBlur("middleName")}
                    placeholder="Middle name (optional)"
                    className="form-control"
                    // style={{ borderColor: getBorderColor("middleName") }}
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={userData.lastName}
                    onChange={handleChange}
                    onBlur={() => handleBlur("lastName")}
                    placeholder="Last name"
                    className="form-control"
                    style={{ borderColor: getBorderColor("lastName") }}
                    required
                  />
                </div>
              </section>

                    {/* Basic Information */}
      
                <section className="account-details bordered-section">
                <p>Account Details</p>
                <div className="input-group">
                  <span className="input-group-text">Email</span>
                  <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur("email")}
                    className="form-control"
                    style={{ borderColor: getBorderColor("email") }}
                    required
                  />
                </div>

                <div className="input-group">
                  <span className="input-group-text">Password</span>
                  <input
                    type="password"
                    name="password"
                    value={userData.password}
                    onChange={handlePasswordChange}
                    onFocus={() =>
                      setInputTriggers((prev) => ({ ...prev, password: false }))
                    }
                    onBlur={() => handleBlur("password")}
                    className="form-control"
                    style={{ borderColor: getBorderColor("password") }}
                    required
                  />
                </div>
                {userData.password && (
                  <PasswordMeter password={userData.password} />
                )}

                <div className="input-group">
                  <span className="input-group-text">Confirm Password</span>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={userData.confirmPassword}
                    onChange={handleChange}
                    onBlur={() => handleBlur("confirmPassword")}
                    className="form-control"
                    style={{ borderColor: getBorderColor("confirmPassword") }}
                    required
                  />
                </div>
              </section>

                    {/* Select Role
                    <div className="form-group">
                      <label>Select Role:</label>
                      <select className="form-control">
                        <option value="">Choose role</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div> */}

                    {/* Account Status
                    <div className="form-group">
                      <label>Account Status:</label>
                      <select className="form-control">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div> */}

                    {/* Add Admin Button */}
                    <button type="submit" className="btn btn-success" onClick={handleRegisterSubmit}>
                      Add Admin
                    </button>
                    
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
