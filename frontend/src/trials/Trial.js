import React, { useEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateField, blurField } from "../redux/signup-form/signupFormSlice";
import { Button } from "react-bootstrap";
import ShowPhotoWithIdAndScannedIdPolicy from "./ShowPhotoWithIdAndScannedIdPolicy";
import emailIcon from "../assets/images/input-icons/email.svg";
import passwordIcon from "../assets/images/input-icons/password.svg";
import hidePasswordIcon from "../assets/images/input-icons/hide-password.svg";
import warningIcon from "../assets/images/input-icons/warning.svg";
import successIcon from "../assets/images/input-icons/success.svg";
import closeIcon from "../assets/images/input-icons/close.svg";
import userIcon from "../assets/images/input-icons/user.svg";
import infoIcon from "../assets/images/input-icons/info.svg";
import "./Trial.css";
import { useDispatch, useSelector } from "react-redux";

const Trial = () => {
  const dispatch = useDispatch();
  const signupDataState = useSelector((state) => state.signupForm);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();
  const [scannedId, setScannedId] = useState(null);
  const [imgWithid, setImgWithId] = useState(null);
  const fileInputRef = useRef(null);
  const [tupId, setTupId] = useState(Array(6).fill("")); // Array of 6 empty strings
  const inputRefs = useRef([]); // Initialize inputRefs as an empty array
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const imgWithIdInputRef = useRef(null);
  const scannedIdInputRef = useRef(null);
  const [showIdPolicyModal, setShowIdPolicyModal] = useState(false);
  const [idPolicyMessage, setIdPolicyMessage] = useState("");

  const handleShowIdPolicyModal = (message) => {
    setIdPolicyMessage(message);
    setShowIdPolicyModal(true);
  };
  const handleCloseIdPolicyModal = () => {
    setShowIdPolicyModal(false);
  };

  const handlePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };

  // Handle change for each digit of TUP ID
  const handleTupIdChange = (index, value) => {
    if (/[^0-9]/.test(value)) {
      return;
    }
    const newTupId = [...tupId];
    newTupId[index] = value;
    setTupId(newTupId);
    dispatch(updateField({ name: "tupId", value: newTupId.join("") }));
    if (value !== "" && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle blur (on losing focus) for the TUP ID input
  const handleBlur = (e, name) => {
    dispatch(blurField({ name: name, value: tupId.join("") }));
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && tupId[index] === "") {
      if (index > 0) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handleImageChange = (e, name) => {
    const file = e.target.files[0];
    dispatch(blurField({ name: name, value: file }));
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        if (name === "imgWithId") {
          setImgWithId(reader.result);
        } else if (name === "scannedId") {
          setScannedId(reader.result);
        }
      };
      reader.readAsDataURL(file);
      dispatch(updateField({ name: name, value: file }));
    }
  };

  const handleRemoveImage = (e, name) => {
    if (name === "imgWithId") {
      if (imgWithIdInputRef.current) {
        imgWithIdInputRef.current.value = null;
      }
      setImgWithId(null);
      dispatch(updateField({name: "imgWithId", value:""}));
      dispatch(blurField({name: "imgWithId", value:""}));
    } else if (name === "scannedId") {
      if (scannedIdInputRef.current) {
        scannedIdInputRef.current.value = null;
      }
      setScannedId(null); // Clear the scanned ID preview
      dispatch(updateField({name: "scannedId", value: ""}));
      dispatch(blurField({name: "scannedId", value:""}));
    }
  };

  return (
    <div className="auth-container">
      {/* First Name Input */}
      <div className="field-container">
        <label htmlFor="firstName" className="label">
          First Name
        </label>
        <div className="input-wrapper">
          <img className="icon" src={userIcon} alt="First Name Icon" />
          <input
            id="firstName"
            name="firstName"
            className="input"
            placeholder="Your First Name"
            required
            type="text"
            value={signupDataState.firstName.value}
            onChange={(e) =>
              dispatch(
                updateField({ name: "firstName", value: e.target.value })
              )
            }
            onBlur={(e) =>
              dispatch(blurField({ name: "firstName", value: e.target.value }))
            }
          />
        </div>
        {signupDataState.firstName.triggered &&
          signupDataState.firstName.hasError && (
            <div className="validation error">
              <img
                src={warningIcon}
                className="icon"
                alt="Error on first name"
              />
              <span className="text">{signupDataState.firstName.error}</span>
            </div>
          )}
      </div>

      {/* Middle Name Input */}
      <div className="field-container">
        <label htmlFor="middleName" className="label">
          Middle Name (Optional)
        </label>
        <div className="input-wrapper">
          <img className="icon" src={userIcon} alt="Middle Name Icon" />
          <input
            id="middleName"
            name="middleName"
            className="input"
            placeholder="Your Middle Name"
            required
            type="text"
            value={signupDataState.middleName.value}
            onChange={(e) =>
              dispatch(
                updateField({ name: "middleName", value: e.target.value })
              )
            }
            onBlur={(e) => dispatch(blurField({name:"middleName", value:e.target.value}))}
          />
        </div>
        {signupDataState.middleName.triggered &&
          signupDataState.middleName.hasError && (
            <div className="validation error">
              <img
                src={warningIcon}
                className="icon"
                alt="Error on middle name"
              />
              <span className="text">{signupDataState.middleName.error}</span>
            </div>
          )}
      </div>

      {/* Last Name Input */}
      <div className="field-container">
        <label htmlFor="lastName" className="label">
          Last Name
        </label>
        <div className="input-wrapper">
          <img className="icon" src={userIcon} alt="Last Name Icon" />
          <input
            id="lastName"
            name="lastName"
            className="input"
            placeholder="Your Last Name"
            required
            type="text"
            value={signupDataState.lastName.value}
            onChange={(e) => dispatch(updateField({name: "lastName", value:e.target.value}))}
            onBlur={(e) => dispatch(blurField({name: "lastName",value: e.target.value}))}
          />
        </div>
        {signupDataState.lastName.triggered &&
          signupDataState.lastName.hasError && (
            <div className="validation error">
              <img
                src={warningIcon}
                className="icon"
                alt="Error on last name"
              />
              <span className="text">{signupDataState.lastName.error}</span>
            </div>
          )}
      </div>

      {/* Email Input */}
      <div className="field-container">
        <label htmlFor="email" className="label">
          Email
        </label>
        <div className="input-wrapper">
          <img className="icon" src={emailIcon} alt="Email Icon" />
          <input
            id="email"
            name="email"
            className="input"
            placeholder="Your email"
            required
            type="email"
            value={signupDataState.email.value}
            onChange={(e) => dispatch(updateField({name: "email", value: e.target.value}))}
            onBlur={(e) => dispatch(blurField({name: "email", value:e.target.value}))}
          />
        </div>
        {signupDataState.email.triggered && signupDataState.email.hasError && (
          <div className="validation error">
            <img src={warningIcon} className="icon" alt="Error on email" />
            <span className="text">{signupDataState.email.error}</span>
          </div>
        )}
      </div>

      {/* Password Input */}
      <div className="field-container">
        <label htmlFor="password" className="label">
          Password
        </label>
        <div className="input-wrapper">
          <img className="icon" src={passwordIcon} alt="Password Icon" />
          <input
            id="password"
            className="input"
            placeholder="Your password"
            required
            type={isPasswordVisible ? "text" : "password"}
            value={signupDataState.password.value}
            onChange={(e) => dispatch(updateField({name: "password", value:e.target.value}))}
            onBlur={(e) => dispatch(blurField({name: "password", value:e.target.value}))}
          />
          <img
            className="password-toggle-icon"
            src={hidePasswordIcon}
            alt="Toggle Password Visibility"
            onClick={handlePasswordVisibility}
          />
        </div>

        {/* Password validation list */}
        {signupDataState.password.validations.length > 0 && (
          <ul className="list">
            {signupDataState.password.validations.map((validation, idx) => (
              <li key={idx}>
                <div
                  className={`validation ${
                    validation.isValid ? "success" : "error"
                  }`}
                >
                  <img
                    src={validation.isValid ? successIcon : warningIcon}
                    className="icon"
                    alt="Error on email"
                  />
                  <span
                    className={`text ${validation.isValid} ? "valid" : "invalid"`}
                    style={{ color: validation.isValid ? "green" : "red" }}
                  >
                    {validation.message}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Confirm Password Input */}
      <div className="field-container">
        <label htmlFor="confirmPassword" className="label">
          Confirm Password
        </label>
        <div className="login input-wrapper">
          <img className="icon" src={passwordIcon} alt="Password Icon" />
          <input
            id="confirmPassword"
            className="input"
            placeholder="Confirm your password"
            required
            type={isPasswordVisible ? "text" : "password"}
            value={signupDataState.confirmPassword.value}
            onChange={(e) =>
              dispatch(updateField({name: "confirmPassword", value:e.target.value}))
            }
            onBlur={(e) =>
              dispatch(blurField({name: "confirmPassword", value:e.target.value}))
            }
          />
          <img
            className="password-toggle-icon"
            src={hidePasswordIcon}
            alt="Toggle Password Visibility"
            onClick={handlePasswordVisibility}
          />
        </div>

        {/* Confirm Password validation list */}
        {signupDataState.confirmPassword.validations.length > 0 && (
          <ul className="list">
            {signupDataState.confirmPassword.validations.map(
              (validation, idx) => (
                <li key={idx}>
                  <div
                    className={`validation ${
                      validation.isValid ? "success" : "error"
                    }`}
                  >
                    <img
                      src={validation.isValid ? successIcon : warningIcon}
                      className="icon"
                      alt="Error on email"
                    />
                    <span
                      className={`text ${validation.isValid} ? "valid" : "invalid"`}
                      style={{ color: validation.isValid ? "green" : "red" }}
                    >
                      {validation.message}
                    </span>
                  </div>
                </li>
              )
            )}
          </ul>
        )}
      </div>

      {/* Tup id Input */}
      <div className="field-container">
        <label htmlFor="tupId" className="label">
          TUP ID
        </label>
        <div className="tupid-input-wrapper">
          {tupId.map((digit, index) => (
            <input
              key={index}
              id={`tup-id-input-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              className="input-box"
              placeholder="-"
              required
              onChange={(e) => handleTupIdChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)} // Handle the Backspace key
              ref={(el) => (inputRefs.current[index] = el)}
              onBlur={(e) => handleBlur(e, "tupId")}
            />
          ))}
        </div>
        {signupDataState.tupId.triggered && signupDataState.tupId.hasError && (
          <div className="validation error">
            <img src={warningIcon} className="icon" alt="Error on TUP ID" />
            <span className="text">{signupDataState.tupId.error}</span>
          </div>
        )}
      </div>

      {/* Image with Id Upload */}
      <div className="field-container">
        <label htmlFor="imgWithId" className="label">
          Image with ID
          <Button
            variant="link"
            onClick={() =>
              handleShowIdPolicyModal(
                "We collect a photo of you together with your ID to verify your identity. This helps ensure that the person associated with the account is accurate and authentic."
              )
            }
          >
            <img
              src={infoIcon}
              className="icon"
              alt="Information on Id Policy"
            />
          </Button>
        </label>

        {/* Image Upload Section */}
        <div className="image-input-wrapper">
          {/* Custom Image Upload Button/Area */}
          <label
            htmlFor="imgWithId"
            className={`image ${
              signupDataState.imgWithId.value ? "has-image" : ""
            }`}
          >
            {signupDataState.imgWithId.value ? (
              <>
                {/* Image Preview */}
                <img src={imgWithid} alt="Preview" className="preview" />
                <div className="hover-overlay">Click to change photo</div>
              </>
            ) : (
              <span className="placeholder-text">Click to upload photo</span>
            )}
          </label>

          <input
            id="imgWithId"
            type="file"
            accept="image/*"
            name="imgWithId"
            onChange={(e) => handleImageChange(e, "imgWithId")}
            ref={imgWithIdInputRef} // Corrected ref
            onBlur={(e) => handleBlur(e, "imgWithId")}
          />

          {signupDataState.imgWithId.value && (
            <button
              className="remove-button"
              onClick={(e) => handleRemoveImage(e, "imgWithId")}
            >
              <img alt="Remove image button" src={closeIcon} />
            </button>
          )}
        </div>

        {/* Error Message (if any) */}
        {signupDataState.imgWithId.triggered &&
          signupDataState.imgWithId.hasError && (
            <div className="validation error">
              {/* Error Icon */}
              <img
                src={warningIcon}
                className="icon"
                alt="Error on Image with ID"
              />
              {/* Error Text */}
              <span className="text">{signupDataState.imgWithId.error}</span>
            </div>
          )}
      </div>

      {/* Scanned ID Upload Section */}
      <div className="field-container">
        <label htmlFor="scannedId" className="label">
          Scanned ID
          <Button
            variant="link"
            onClick={() =>
              handleShowIdPolicyModal(
                "We ask for your ID to confirm your identity with official documentation. This helps us ensure that the information you provide is correct."
              )
            }
          >
            <img
              src={infoIcon}
              className="icon"
              alt="Information on Id Policy"
            />
          </Button>
        </label>

        <div className="image-input-wrapper">
          <label
            htmlFor="scannedId"
            className={`image ${
              signupDataState.scannedId.value ? "has-image" : ""
            }`}
          >
            {signupDataState.scannedId.value ? (
              <>
                <img
                  src={scannedId}
                  alt="Scanned ID Preview"
                  className="preview"
                />
                <div className="hover-overlay">Click to change photo</div>
              </>
            ) : (
              <span className="placeholder-text">
                Click to upload scanned ID
              </span>
            )}
          </label>

          <input
            id="scannedId"
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e, "scannedId")}
            ref={scannedIdInputRef}
            onBlur={(e) => handleBlur(e, "scannedId")}
          />

          {signupDataState.scannedId.value && (
            <button
              className="remove-button"
              onClick={(e) => handleRemoveImage(e, "scannedId")}
            >
              <img alt="Remove image button" src={closeIcon} />
            </button>
          )}
        </div>

        {/* Error message (if any) */}
        {signupDataState.scannedId.triggered &&
          signupDataState.scannedId.hasError && (
            <div className="validation error">
              <img
                src={warningIcon}
                className="icon"
                alt="Error on Scanned ID"
              />
              <span className="text">{signupDataState.scannedId.error}</span>
            </div>
          )}
      </div>

      {/* Error message */}
      {errorMessage && <div className="validation error">{errorMessage}</div>}

      {/* Submit Button */}
      <button
        className="btn btn-primary"
        onClick={""}
        disabled={!signupDataState.isFormValid}
      >
        Sign up
      </button>

      {/* Forgot Password */}
      <button className="btn btn-secondary">Forgot Password</button>

      <div className="or-divider">
        <span>or</span>
      </div>

      {/* Sign-up Link */}
      <p>
        Don't have an account? <a className="link">Sign up here!</a>
      </p>

      <ShowPhotoWithIdAndScannedIdPolicy
        show={showIdPolicyModal}
        onClose={handleCloseIdPolicyModal}
        message={idPolicyMessage}
        images={[
          "https://via.placeholder.com/600x400?text=Photo+1",
          "https://via.placeholder.com/600x400?text=Photo+2",
          "https://via.placeholder.com/600x400?text=Photo+3",
        ]}
      />
    </div>
  );
};

export default Trial;
