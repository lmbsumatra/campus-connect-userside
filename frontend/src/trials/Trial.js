import React, { useEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UPDATE_FORM,
  onInputChange,
  onBlur,
} from "../hooks/input-reducers/signupInputReducer";
import emailIcon from "../assets/images/input-icons/email.svg";
import passwordIcon from "../assets/images/input-icons/password.svg";
import hidePasswordIcon from "../assets/images/input-icons/hide-password.svg";
import warningIcon from "../assets/images/input-icons/warning.svg";
import successIcon from "../assets/images/input-icons/success.svg";
import closeIcon from "../assets/images/input-icons/close.svg";
import userIcon from "../assets/images/input-icons/user.svg";
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
  const [tupId, setTupId] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const handlePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };

  const handleTupIdChange = (index, value) => {
    const newTupId = [...tupId];
    newTupId[index] = value;
    setTupId(newTupId);

    onInputChange("tupId", newTupId.join(""), dispatch, loginDataState);
    onBlur("tupId", newTupId.join(""), dispatch, loginDataState);

    if (value.length === 1 && index < tupId.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && tupId[index] === "") {
      if (index > 0) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      onInputChange("imgWithId", file, dispatch, loginDataState);
      onBlur("imgWithId", file, dispatch, loginDataState);
      const reader = new FileReader();
      reader.onload = () => {
        setImgWithId(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }

    setImgWithId(null);
    onInputChange("imgWithId", "", dispatch, loginDataState);
    onBlur("imgWithId", "", dispatch, loginDataState);
  };

  const handleScannedIdChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      onInputChange("scannedId", file, dispatch, loginDataState);
      onBlur("scannedId", file, dispatch, loginDataState);

      const reader = new FileReader();
      reader.onload = () => {
        setScannedId(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveScannedId = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
    setScannedId(null);
    onInputChange("scannedId", "", dispatch, loginDataState);
    onBlur("scannedId", "", dispatch, loginDataState);
  };

  return (
    <div className="m-5 d-flex flex-column align-items-center">
      {/* First Name Input */}
      <div className="form-wrapper">
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
      <div className="form-wrapper">
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
      <div className="form-wrapper">
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
      <div className="form-wrapper">
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
      <div className="form-wrapper">
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
      <div className="form-wrapper">
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
      <div className="form-wrapper">
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
      <div className="form-wrapper">
        {/* Label for Image Upload */}
        <label htmlFor="imgWithId" className="label">
          Image with ID
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
            onChange={handleImageChange}
            style={{ display: "none" }}
            ref={fileInputRef}
          />

          {loginDataState.imgWithId.value && (
            <button className="remove-button" onClick={handleRemoveImage}>
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
      <div className="form-wrapper">
        <label htmlFor="scannedId" className="label">
          Scanned ID
        </label>

        <div className="image-input-wrapper">
          {/* Custom Upload Area for Scanned ID */}
          <label
            htmlFor="scannedId"
            className={`image ${
              loginDataState.scannedId.value ? "has-image" : ""
            }`}
          >
            {loginDataState.scannedId.value ? (
              <>
                {/* Scanned ID Preview */}
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
            onChange={handleScannedIdChange}
            style={{ display: "none" }}
            ref={fileInputRef}
          />

          {loginDataState.scannedId.value && (
            <button className="remove-button" onClick={handleRemoveScannedId}>
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
    </div>
  );
};

export default Trial;
