import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./loginSignupStyle.css";
import { GoogleLogin } from "@react-oauth/google";
import { Dropdown } from "react-bootstrap";
import PasswordMeter from "../../../components/common/PasswordMeter";

const LoginSignUp = ({ tab, onClose }) => {
  const navigate = useNavigate();
  const [authTab, setAuthTab] = useState(tab);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedId, setUploadedId] = useState(null);
  const [selectedCollege, setSelectedCollege] = useState("Select your college");

  // User data state
  const [userData, setUserData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    middleName: "",
    tupId: "",
    confirmPassword: "",
  });

  // State to manage triggers for inputs
  const [inputTriggers, setInputTriggers] = useState({
    email: false,
    password: false,
    firstName: false,
    lastName: false,
    middleName: false,
    tupId: false,
    confirmPassword: false,
  });

  useEffect(() => {
    setAuthTab(tab);
  }, [tab]);

  const handleTabClick = (tab) => {
    setAuthTab(tab);
    resetForm();
  };

  const resetForm = () => {
    setUploadedImage(null);
    setUploadedId(null);
    setUserData({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      middleName: "",
      tupId: "",
      confirmPassword: "",
    });
    setInputTriggers({
      email: false,
      password: false,
      firstName: false,
      lastName: false,
      middleName: false,
      tupId: false,
      confirmPassword: false,
    });
  };

  const handleImageUpload = (e, setImage) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result.split(",")[1]); // Save only the base64 part
      reader.readAsDataURL(file);
    }
  };

  const handleSelectCollege = (eventKey) => {
    setSelectedCollege(eventKey);
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
    console.log("Submitting registration form...");

    if (userData.password !== userData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const formData = new FormData();
    formData.append("first_name", userData.firstName);
    formData.append("middle_name", userData.middleName);
    formData.append("last_name", userData.lastName);
    formData.append("email", userData.email);
    formData.append("password", userData.password);
    formData.append("tup_id", userData.tupId);
    formData.append("college", selectedCollege);
    formData.append("scanned_id", uploadedId);
    formData.append("photo_with_id", uploadedImage);
    formData.append("role", "student");

    try {
      const response = await fetch("http://localhost:3001/user/register", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("User registered successfully:", data);
        navigate("/success");
      } else {
        const errorData = await response.json();
        console.error("Registration failed:", errorData);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting login form...");

    try {
      const response = await fetch("http://localhost:3001/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Login successful:", data);
        navigate("/dashboard"); // Redirect to a dashboard or home page
      } else {
        const errorData = await response.json();
        console.error("Login failed:", errorData);
        alert("Login failed: " + errorData.message);
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  return (
    <div className="auth-container">
      <div className="close-button" onClick={onClose}>
        &times;
      </div>
      <div className="tab-buttons">
        <div
          onClick={() => handleTabClick("loginTab")}
          className={`tab ${authTab === "loginTab" ? "active" : ""}`}
        >
          Log In
        </div>
        <div
          onClick={() => handleTabClick("registerTab")}
          className={`tab ${authTab === "registerTab" ? "active" : ""}`}
        >
          Sign Up
        </div>
      </div>
      <div className="auth-scrollable">
        <form onSubmit={authTab === "loginTab" ? handleLoginSubmit : handleRegisterSubmit}>
          {authTab === "loginTab" ? (
            <div className="auth-form">
              <h2>Welcome back</h2>
              <div>
                <label>Email</label>
                <input
                  type="text"
                  name="email"
                  value={userData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur("email")}
                  className="form-control rounded"
                  placeholder="Username"
                  style={{ borderColor: getBorderColor("email") }}
                  required
                />
              </div>
              <div>
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={userData.password}
                  onChange={handlePasswordChange}
                  onBlur={() => handleBlur("password")}
                  className="form-control rounded"
                  style={{ borderColor: getBorderColor("password") }}
                  placeholder="Password"
                  required
                />
              </div>
              <div className="action-buttons d-block">
                <button type="submit" className="btn btn-primary w-100">
                  Log In
                </button>
                <button className="btn btn-secondary w-100">
                  Forgot Password
                </button>
                <GoogleLogin
                  onSuccess={"responseMessage"}
                  onError={"errorMessage"}
                />
                <div className="or-divider">
                  <span>or</span>
                </div>
                <p>
                  Don't have an account?{" "}
                  <a onClick={() => handleTabClick("registerTab")} className="link">
                    Sign up here!
                  </a>
                </p>
              </div>
            </div>
          ) : (
            <div className="auth-form">
              <h2>Connect and Earn</h2>
              <section className="personal-details bordered-section">
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
                    onBlur={() => handleBlur("middleName")}
                    placeholder="Middle name (optional)"
                    className="form-control"
                    style={{ borderColor: getBorderColor("middleName") }}
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

              <section className="school-details bordered-section">
                <p>School Details</p>
                <div className="input-group">
                  <span className="input-group-text">TUP ID</span>
                  <input
                    type="text"
                    name="tupId"
                    value={userData.tupId}
                    onChange={handleChange}
                    onBlur={() => handleBlur("tupId")}
                    className="form-control"
                    style={{ borderColor: getBorderColor("tupId") }}
                    required
                  />
                </div>
                <label>College</label>
                <Dropdown onSelect={handleSelectCollege}>
                  <Dropdown.Toggle
                    id="college-dropdown"
                    variant="success"
                    className="w-100"
                  >
                    {selectedCollege}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item eventKey="CAFA">CAFA</Dropdown.Item>
                    <Dropdown.Item eventKey="CIE">CIE</Dropdown.Item>
                    <Dropdown.Item eventKey="CIT">CIT</Dropdown.Item>
                    <Dropdown.Item eventKey="CLA">CLA</Dropdown.Item>
                    <Dropdown.Item eventKey="COE">COE</Dropdown.Item>
                    <Dropdown.Item eventKey="COS">COS</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                <div className="image-upload-group">
                  <div>
                    <label>A photo holding your ID</label>
                    <div
                      className="upload-box"
                      onClick={() => document.getElementById("uploadImageInput").click()}
                    >
                      {uploadedImage ? (
                        <img
                          src={`data:image/png;base64,${uploadedImage}`}
                          alt="Uploaded Image"
                          className="preview"
                        />
                      ) : (
                        <div className="preview">
                          Drag & drop your image here or click to upload
                        </div>
                      )}
                      <input
                        type="file"
                        id="uploadImageInput"
                        style={{ display: "none" }}
                        onChange={(e) => handleImageUpload(e, setUploadedImage)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label>Scanned ID</label>
                    <div
                      className="upload-box"
                      onClick={() => document.getElementById("uploadIdInput").click()}
                    >
                      {uploadedId ? (
                        <img
                          src={`data:image/png;base64,${uploadedId}`}
                          alt="Uploaded ID"
                          className="preview"
                        />
                      ) : (
                        <div className="preview">
                          Drag & drop your image here or click to upload
                        </div>
                      )}
                      <input
                        type="file"
                        id="uploadIdInput"
                        style={{ display: "none" }}
                        onChange={(e) => handleImageUpload(e, setUploadedId)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </section>

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

              <div className="action-buttons d-block">
                <button type="submit" className="btn btn-primary w-100">
                  Sign Up
                </button>
                <div className="or-divider">
                  <span>or</span>
                </div>
                <p>
                  Already have an account?{" "}
                  <a onClick={() => handleTabClick("loginTab")} className="link">
                    Log in here.
                  </a>
                </p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginSignUp;
