import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./loginSignupStyle.css"; // Ensure to create and import this CSS file

const LoginSignUp = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [isLogin, setIsLogin] = useState(true);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedId, setUploadedId] = useState(null);

  const handleTabClick = (tab) => {
    setIsLogin(tab === "login");
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

  return (
    <div className="auth-container">
      <div className="tab-buttons">
        <div
          onClick={() => handleTabClick("login")}
          className={`tab ${isLogin ? "active" : ""}`}
        >
          Log In
        </div>
        <div
          onClick={() => handleTabClick("signup")}
          className={`tab ${!isLogin ? "active" : ""}`}
        >
          Sign Up
        </div>
      </div>

      {isLogin ? (
        <div>
          <h2>Welcome back</h2>
          <div className="input-field">
            <input type="email" required placeholder=" " />
            <label>Email Address</label>
          </div>
          <div className="input-field">
            <input type="password" required placeholder=" " />
            <label>Password</label>
          </div>
          <div className="action-buttons d-block">
            <button className="btn btn-primary">Log In</button>
            <button className="btn btn-secondary">Forgot Password</button>
            <div className="or-divider">
              <span>or</span>
            </div>
            <p>
              Don't have an account?{" "}
              <span
                onClick={() => {
                  handleTabClick("signup"); // Switch to signup tab
                }}
                className="link"
              >
                Sign up here!
              </span>
            </p>
          </div>
        </div>
      ) : (
        <div>
          <h2>Connect and Earn</h2>
          <div className="d-flex">
            <div>
              <div className="input-field">
                <input type="text" required placeholder=" " />
                <label>First Name</label>
              </div>
              <div className="input-field">
                <input type="text" placeholder=" " />
                <label>Middle Name</label>
              </div>
              <div className="input-field">
                <input type="text" required placeholder=" " />
                <label>Surname</label>
              </div>
              <div className="input-field-dropdown">
                <label>College</label>
                <select>
                  <option value="option1">Explore</option>
                  <option value="option2">Option 2</option>
                  <option value="option3">Option 3</option>
                </select>
              </div>
            </div>
            <div>
              <div className="input-field">
                <input type="email" required placeholder=" " />
                <label>Email</label>
              </div>
              <div className="input-field">
                <input type="password" required placeholder=" " />
                <label>Password</label>
              </div>
              <div className="input-field">
                <input type="password" required placeholder=" " />
                <label>Confirm Password</label>
              </div>
              <div className="d-flex">
                <div className="input-field-img">
                  <label>Upload Image</label>
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
                      <p>Drag & drop your image here or click to upload</p>
                    )}
                    <input
                      type="file"
                      id="uploadImageInput"
                      style={{ display: "none" }}
                      onChange={(e) => handleImageUpload(e, setUploadedImage)}
                    />
                  </div>
                </div>

                <div className="input-field-img">
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
                      <p>Drag & drop your ID here or click to upload</p>
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
            </div>
          </div>
          <div className="action-buttons d-block">
            <button className="btn btn-primary">Sign Up</button>
            <div className="or-divider">
              <span>or</span>
            </div>
            <p>
              Already have an account?{" "}
              <span
                onClick={() => {
                  handleTabClick("login"); // Switch to login tab
                }}
                className="link"
              >
                Log in here.
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginSignUp;
