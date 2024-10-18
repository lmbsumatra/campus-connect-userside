import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./loginSignupStyle.css";
import { GoogleLogin } from "@react-oauth/google";
import { Dropdown } from "react-bootstrap";

const LoginSignUp = ({ tab, onClose }) => {
  const navigate = useNavigate();
  const [authTab, setAuthTab] = useState(tab);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedId, setUploadedId] = useState(null);
  const [selectedCollege, setSelectedCollege] = useState("Select your college");

  useEffect(() => {
    setAuthTab(tab);
  }, [tab]);

  const handleTabClick = (tab) => {
    setAuthTab(tab);
    setUploadedImage(null);
    setUploadedId(null);
  };

  const handleImageUpload = (e, setImage) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSelectCollege = (eventKey) => {
    setSelectedCollege(eventKey);
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
        {authTab === "loginTab" ? (
          <div className="auth-form">
            <h2>Welcome back</h2>
            <div className="">
              <label>Email</label>
              <input
                type="text"
                class="form-control rounded"
                placeholder="Username"
              />
            </div>
            <div className="">
              <label>Password</label>
              <input
                type="password"
                class="form-control rounded"
                placeholder="Password"
              />
            </div>
            <div className="action-buttons d-block">
              <button className="btn btn-primary w-100">Log In</button>
              <button className="btn btn-secondary w-100">Forgot Password</button>
              <GoogleLogin
                onSuccess={"responseMessage"}
                onError={"errorMessage"}
              />
              <div className="or-divider">
                <span>or</span>
              </div>
              <p>
                Don't have an account?{" "}
                <a
                  onClick={() => handleTabClick("registerTab")}
                  className="link"
                >
                  Sign up here!
                </a>
              </p>
            </div>
          </div>
        ) : (
          <div className="auth-form">
            <h2>Connect and Earn</h2>

            {/* Personal Details Section */}
            <section className="personal-details bordered-section">
              <p>Personal Details</p>
              <label>Input your complete name</label>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="First name"
                  className="form-control"
                />
                <input
                  type="text"
                  placeholder="Middle name (optional)"
                  className="form-control"
                />
                <input
                  type="text"
                  placeholder="Last name"
                  className="form-control"
                />
              </div>
            </section>

            {/* School Details Section */}
            <section className="school-details bordered-section">
              <p>School Details</p>
              <div className="input-group">
                <span className="input-group-text">TUP ID</span>
                <input type="text" className="form-control" />
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

              {/* Image Upload Section */}

              <div className="image-upload-group">
                <div>
                  <label>A photo holding your ID</label>
                  <div
                    className="upload-box"
                    onClick={() =>
                      document.getElementById("uploadImageInput").click()
                    }
                  >
                    {uploadedImage ? (
                      <img
                        src={uploadedImage}
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
                    />
                  </div>
                </div>
                <div>
                  <label>Scanned ID</label>
                  <div
                    className="upload-box"
                    onClick={() =>
                      document.getElementById("uploadIdInput").click()
                    }
                  >
                    {uploadedId ? (
                      <img
                        src={uploadedId}
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
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Account Details Section */}
            <section className="account-details bordered-section">
              <p>Account Details</p>
              <div className="input-group">
                <span className="input-group-text">Email</span>
                <input type="email" className="form-control" />
              </div>
              <div className="input-group">
                <span className="input-group-text">Password</span>
                <input type="password" className="form-control" />
              </div>
              <div className="input-group">
                <span className="input-group-text">Confirm Password</span>
                <input type="password" className="form-control" />
              </div>
            </section>

            {/* Action Buttons */}
            <div className="action-buttons d-block">
              <button className="btn btn-primary w-100">Sign Up</button>
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
      </div>
    </div>
  );
};

export default LoginSignUp;
