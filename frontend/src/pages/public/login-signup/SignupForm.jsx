import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import PasswordMeter from "../../../components/common/PasswordMeter";
import { useAuth } from "../../../context/AuthContext";
import "./loginSignupStyle.css";
import showPassword from "../../../assets/images/icons/eye-open.svg";
import hidePassword from "../../../assets/images/icons/eye-closed.svg";
import { baseApi } from "../../../App";
import { resetSignupForm } from "../../../redux/signup-form/signupFormSlice";

// Helper function to validate form fields and check for empty required fields
const validateRequiredFields = (
  userData,
  uploadedId,
  uploadedImage,
  uploadedCor,
  selectedCollege
) => {
  return (
    !userData.firstName ||
    !userData.lastName ||
    !userData.email ||
    !userData.password ||
    !userData.confirmPassword ||
    !userData.tupId ||
    !selectedCollege ||
    !uploadedId ||
    !uploadedImage ||
    !uploadedCor
  );
};

// Helper function to check if passwords match
const validatePasswordMatch = (userData) => {
  return userData.password !== userData.confirmPassword;
};

const SignupForm = ({ tab, handleTabClick, errorMessage, setErrorMessage }) => {
  const { loginStudent } = useAuth();
  const navigate = useNavigate();
  const errorRef = useRef(null);

  // Form states
  const [authTab, setAuthTab] = useState(tab);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedId, setUploadedId] = useState(null);
  const [uploadedCor, setUploadedCor] = useState(null);
  const [selectedCollege, setSelectedCollege] = useState("Select your college");
  const [imageTouched, setImageTouched] = useState(false);
  const [idTouched, setIdTouched] = useState(false);
  const [corTouched, setCorTouched] = useState(false);
  const [collegeTouched, setCollegeTouched] = useState(false);
  const [inputWarning, setInputWarning] = useState(false);
  const [isShowPassword, setShowPassword] = useState(false);
  const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false);

  const handleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleShowConfirmPassword = () => {
    setIsShowConfirmPassword(!isShowConfirmPassword);
  };

  const [userData, setUserData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    middleName: "",
    tupId: "",
    confirmPassword: "",
  });

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

  useEffect(() => {}, [selectedCollege, inputWarning]);

  const handleImageUpload = (e, setImage) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleImageClick = () => {
    setImageTouched(true);
    document.getElementById("uploadImageInput").click();
  };

  const handleIdClick = () => {
    setIdTouched(true);
    document.getElementById("uploadIdInput").click();
  };

  const handleCorClick = () => {
    setCorTouched(true);
    document.getElementById("uploadCorInput").click();
  };

  const handleSelectCollege = (eventKey) => {
    setSelectedCollege(eventKey);
    setCollegeTouched(true);
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

    // Validate form fields
    if (
      validateRequiredFields(
        userData,
        uploadedId,
        uploadedImage,
        uploadedCor,
        selectedCollege
      )
    ) {
      setErrorMessage("Please fill in all required fields.");
      errorRef.current.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (validatePasswordMatch(userData)) {
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
    formData.append("tup_id", userData.tupId);
    formData.append("college", selectedCollege);
    formData.append("scanned_id", uploadedId);
    formData.append("photo_with_id", uploadedImage);
    formData.append("cor_image", uploadedCor);
    formData.append("role", "student");

    try {
      const response = await fetch(`${baseApi}/user/register`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        alert("Registered Successfully");
        resetSignupForm();
      } else {
        const errorData = await response.json();
        setErrorMessage(
          errorData.message || "Registration failed. Please try again."
        );
        errorRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again later.");
      errorRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div>
      <form onSubmit={handleRegisterSubmit}>
        <div className="auth-form">
          <h2 ref={errorRef}>Connect and Earn</h2>
          <span
            className={`${errorMessage ? "text-danger" : "text-secondary"}`}
          >
            {errorMessage || "Please complete all required fields to register."}
          </span>

          {/* Personal Details Section */}
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
                placeholder="Middle name (optional)"
                className="form-control"
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

          {/* School Details Section */}
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
            <div>
              <label>College</label>
              <Dropdown onSelect={handleSelectCollege}>
                <Dropdown.Toggle
                  id="college-dropdown"
                  variant="success"
                  className="w-100"
                  style={{
                    borderColor:
                      collegeTouched === false &&
                      selectedCollege === "Select your college"
                        ? "red"
                        : "",
                  }}
                >
                  {selectedCollege}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item eventKey="CAFA">
                    College of Architecture Fine Arts
                  </Dropdown.Item>
                  <Dropdown.Item eventKey="CIE">
                    College of Industrial Education
                  </Dropdown.Item>
                  <Dropdown.Item eventKey="CIT">
                    College of Industrial Technology
                  </Dropdown.Item>
                  <Dropdown.Item eventKey="CLA">
                    College of Liberal Arts
                  </Dropdown.Item>
                  <Dropdown.Item eventKey="COE">
                    College of Engineering
                  </Dropdown.Item>
                  <Dropdown.Item eventKey="COS">
                    College of Science
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>

            <div className="image-upload-group">
              <div>
                <label>A photo holding your ID</label>
                <div
                  className="upload-box"
                  onClick={handleImageClick}
                  style={{
                    borderColor:
                      imageTouched && uploadedImage === null ? "red" : "",
                  }}
                >
                  {uploadedImage ? (
                    <img
                      src={URL.createObjectURL(uploadedImage)}
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
                  onClick={handleIdClick}
                  style={{
                    borderColor: idTouched && uploadedId === null ? "red" : "",
                  }}
                >
                  {uploadedId ? (
                    <img
                      src={URL.createObjectURL(uploadedId)}
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
              <div>
                <label>Certificate of Registration (COR)</label>
                <div
                  className="upload-box"
                  onClick={handleCorClick}
                  style={{
                    borderColor: corTouched && uploadedCor === null ? "red" : "",
                  }}
                >
                  {uploadedCor ? (
                    <img
                      src={URL.createObjectURL(uploadedCor)}
                      alt="Uploaded COR"
                      className="preview"
                    />
                  ) : (
                    <div className="preview">
                      Drag & drop your COR here or click to upload
                    </div>
                  )}
                  <input
                    type="file"
                    id="uploadCorInput"
                    style={{ display: "none" }}
                    onChange={(e) => handleImageUpload(e, setUploadedCor)}
                    required
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
              {/* <div className="input-container"> */}
              <input
                type={isShowPassword ? "text" : "password"}
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
              <div className="signup pass-icon" onClick={handleShowPassword}>
                <img
                  src={isShowPassword ? showPassword : hidePassword}
                  alt="Toggle password visibility"
                />
              </div>
              {/* </div> */}
            </div>
            {userData.password && (
              <PasswordMeter password={userData.password} />
            )}

            <div className="input-group">
              <span className="input-group-text">Confirm Password</span>
              {/* <div className="input-container"> */}
              <input
                type={isShowConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={userData.confirmPassword}
                onChange={handleChange}
                onBlur={() => handleBlur("confirmPassword")}
                className="form-control"
                style={{ borderColor: getBorderColor("confirmPassword") }}
                required
              />
              <div
                className="signup pass-icon"
                onClick={handleShowConfirmPassword}
              >
                <img
                  src={isShowConfirmPassword ? showPassword : hidePassword}
                  alt="Toggle password visibility"
                />
              </div>
              {/* </div> */}
            </div>
          </section>

          {/* Submit Button */}
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
      </form>
    </div>
  );
};

export default SignupForm;
