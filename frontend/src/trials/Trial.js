import React, { useEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UPDATE_FORM,
  onInputChange,
  onBlur,
} from "../hooks/input-reducers/signupInputReducer";
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

const initialState = {
  firstName: { value: "", triggered: false, hasError: true, error: "" },
  middleName: { value: "", triggered: false, hasError: true, error: "" },
  lastName: { value: "", triggered: false, hasError: true, error: "" },
  imgWithId: { value: "", triggered: false, hasError: true, error: "" },
  scannedId: { value: "", triggered: false, hasError: true, error: "" },
  email: { value: "", triggered: false, hasError: true, error: "" },
  password: {
    value: "",
    triggered: false,
    hasError: true,
    error: "",
    validations: [],
  },
  confirmPassword: {
    value: "",
    triggered: false,
    hasError: true,
    error: "",
    validations: [],
  },
  tupId: {
    value: ["", "", "", "", "", ""],
    hasError: false,
    error: "",
    triggered: false,
  },
  isFormValid: false,
};

const formsReducer = (state, action) => {
  switch (action.type) {
    case UPDATE_FORM:
      return {
        ...state,
        [action.data.name]: {
          ...state[action.data.name],
          value: action.data.value,
          hasError: action.data.hasError,
          error: action.data.error,
          validations:
            action.data.validations || state[action.data.name].validations,
          triggered: action.data.triggered,
        },
        isFormValid: action.data.isFormValid,
      };
    default:
      return state;
  }
};

const Trial = () => {
  const [loginDataState, dispatch] = useReducer(formsReducer, initialState);
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
    onInputChange("tupId", newTupId.join(""), dispatch, loginDataState);
    if (value !== "" && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle blur (on losing focus) for the TUP ID input
  const handleBlur = (e, name) => {
    onBlur(name, tupId.join(""), dispatch, loginDataState);
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
    onBlur(name, file, dispatch, loginDataState);
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
      onInputChange(name, file, dispatch, loginDataState);
    }
  };

  const handleRemoveImage = (e, name) => {
    if (name === "imgWithId") {
      if (imgWithIdInputRef.current) {
        imgWithIdInputRef.current.value = null;
      }
      setImgWithId(null);
      onInputChange("imgWithId", "", dispatch, loginDataState);
      onBlur("imgWithId", "", dispatch, loginDataState);
    } else if (name === "scannedId") {
      if (scannedIdInputRef.current) {
        scannedIdInputRef.current.value = null;
      }
      setScannedId(null); // Clear the scanned ID preview
      onInputChange("scannedId", "", dispatch, loginDataState);
      onBlur("scannedId", "", dispatch, loginDataState);
    }
  };

  return (
    <div className="">
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
            value={loginDataState.firstName.value}
            onChange={(e) =>
              onInputChange(
                "firstName",
                e.target.value,
                dispatch,
                loginDataState
              )
            }
            onBlur={(e) =>
              onBlur("firstName", e.target.value, dispatch, loginDataState)
            }
          />
        </div>
        {loginDataState.firstName.triggered &&
          loginDataState.firstName.hasError && (
            <div className="validation error">
              <img
                src={warningIcon}
                className="icon"
                alt="Error on first name"
              />
              <span className="text">{loginDataState.firstName.error}</span>
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
            value={loginDataState.middleName.value}
            onChange={(e) =>
              onInputChange(
                "middleName",
                e.target.value,
                dispatch,
                loginDataState
              )
            }
            onBlur={(e) =>
              onBlur("middleName", e.target.value, dispatch, loginDataState)
            }
          />
        </div>
        {loginDataState.middleName.triggered &&
          loginDataState.middleName.hasError && (
            <div className="validation error">
              <img
                src={warningIcon}
                className="icon"
                alt="Error on middle name"
              />
              <span className="text">{loginDataState.middleName.error}</span>
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
            value={loginDataState.lastName.value}
            onChange={(e) =>
              onInputChange(
                "lastName",
                e.target.value,
                dispatch,
                loginDataState
              )
            }
            onBlur={(e) =>
              onBlur("lastName", e.target.value, dispatch, loginDataState)
            }
          />
        </div>
        {loginDataState.lastName.triggered &&
          loginDataState.lastName.hasError && (
            <div className="validation error">
              <img
                src={warningIcon}
                className="icon"
                alt="Error on last name"
              />
              <span className="text">{loginDataState.lastName.error}</span>
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
            value={loginDataState.email.value}
            onChange={(e) =>
              onInputChange("email", e.target.value, dispatch, loginDataState)
            }
            onBlur={(e) =>
              onBlur("email", e.target.value, dispatch, loginDataState)
            }
          />
        </div>
        {loginDataState.email.triggered && loginDataState.email.hasError && (
          <div className="validation error">
            <img src={warningIcon} className="icon" alt="Error on email" />
            <span className="text">{loginDataState.email.error}</span>
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
            value={loginDataState.password.value}
            onChange={(e) =>
              onInputChange(
                "password",
                e.target.value,
                dispatch,
                loginDataState
              )
            }
            onBlur={(e) =>
              onBlur("password", e.target.value, dispatch, loginDataState)
            }
          />
          <img
            className="password-toggle-icon"
            src={hidePasswordIcon}
            alt="Toggle Password Visibility"
            onClick={handlePasswordVisibility}
          />
        </div>

        {/* Password validation list */}
        {loginDataState.password.validations.length > 0 && (
          <ul className="list">
            {loginDataState.password.validations.map((validation, idx) => (
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
            value={loginDataState.confirmPassword.value}
            onChange={(e) =>
              onInputChange(
                "confirmPassword",
                e.target.value,
                dispatch,
                loginDataState
              )
            }
            onBlur={(e) =>
              onBlur(
                "confirmPassword",
                e.target.value,
                dispatch,
                loginDataState
              )
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
        {loginDataState.confirmPassword.validations.length > 0 && (
          <ul className="list">
            {loginDataState.confirmPassword.validations.map(
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
        {loginDataState.tupId.triggered && loginDataState.tupId.hasError && (
          <div className="validation error">
            <img src={warningIcon} className="icon" alt="Error on TUP ID" />
            <span className="text">{loginDataState.tupId.error}</span>
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
              loginDataState.imgWithId.value ? "has-image" : ""
            }`}
          >
            {loginDataState.imgWithId.value ? (
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

          {loginDataState.imgWithId.value && (
            <button
              className="remove-button"
              onClick={(e) => handleRemoveImage(e, "imgWithId")}
            >
              <img alt="Remove image button" src={closeIcon} />
            </button>
          )}
        </div>

        {/* Error Message (if any) */}
        {loginDataState.imgWithId.triggered &&
          loginDataState.imgWithId.hasError && (
            <div className="validation error">
              {/* Error Icon */}
              <img
                src={warningIcon}
                className="icon"
                alt="Error on Image with ID"
              />
              {/* Error Text */}
              <span className="text">{loginDataState.imgWithId.error}</span>
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
              loginDataState.scannedId.value ? "has-image" : ""
            }`}
          >
            {loginDataState.scannedId.value ? (
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

          {loginDataState.scannedId.value && (
            <button
              className="remove-button"
              onClick={(e) => handleRemoveImage(e, "scannedId")}
            >
              <img alt="Remove image button" src={closeIcon} />
            </button>
          )}
        </div>

        {/* Error message (if any) */}
        {loginDataState.scannedId.triggered &&
          loginDataState.scannedId.hasError && (
            <div className="validation error">
              <img
                src={warningIcon}
                className="icon"
                alt="Error on Scanned ID"
              />
              <span className="text">{loginDataState.scannedId.error}</span>
            </div>
          )}
      </div>

      {/* Error message */}
      {errorMessage && <div className="validation error">{errorMessage}</div>}

      {/* Submit Button */}
      <button
        className="btn btn-primary"
        onClick={""}
        disabled={!loginDataState.isFormValid}
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
