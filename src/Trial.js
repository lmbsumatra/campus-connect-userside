import React, { useEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import useGoogleLogin from "./hooks/useGoogleLogin";
import useManualLogin from "./hooks/useManualLogin";
import { useAuth } from "./context/AuthContext";
import {
  UPDATE_FORM,
  onInputChange,
  onBlur,
} from "./hooks/input-reducers/signupInputReducer";
import emailIcon from "./assets/images/input-icons/email.svg";
import passwordIcon from "./assets/images/input-icons/password.svg";
import hidePasswordIcon from "./assets/images/input-icons/hide-password.svg";
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

  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const handlePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };

  const [tupId, setTupId] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const handleTupIdChange = (index, value) => {
    // Update the value in the state array
    const newTupId = [...tupId];
    newTupId[index] = value;
    setTupId(newTupId);

    // If the current input is filled, move focus to the next input
    if (value.length === 1 && index < tupId.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, event) => {
    // If the user presses Backspace and the input is empty, move focus to the previous input
    if (event.key === "Backspace" && tupId[index] === "") {
      if (index > 0) {
        inputRefs.current[index - 1].focus(); // Focus the previous input
      }
    }
  };

  return (
    <div className="m-5 d-flex flex-column align-items-center">
      {/* First Name Input */}
      <div className="form-wrapper">
        <label htmlFor="firstName" className="label">
          First Name
        </label>
        <div className="login input-wrapper">
          <img className="icon" src={emailIcon} alt="First Name Icon" />
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
            <div className="error">{loginDataState.firstName.error}</div>
          )}
      </div>

      {/* Middle Name Input */}
      <div className="form-wrapper">
        <label htmlFor="middleName" className="label">
          Middle Name
        </label>
        <div className="login input-wrapper">
          <img className="icon" src={emailIcon} alt="Middle Name Icon" />
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
            <div className="error">{loginDataState.middleName.error}</div>
          )}
      </div>

      {/* Last Name Input */}
      <div className="form-wrapper">
        <label htmlFor="lastName" className="label">
          Last Name
        </label>
        <div className="login input-wrapper">
          <img className="icon" src={emailIcon} alt="Last Name Icon" />
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
            <div className="error">{loginDataState.lastName.error}</div>
          )}
      </div>

      {/* Email Input */}
      <div className="form-wrapper">
        <label htmlFor="email" className="label">
          Email
        </label>
        <div className="login input-wrapper">
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
          <div className="error">{loginDataState.email.error}</div>
        )}
      </div>

      {/* Password Input */}
      <div className="form-wrapper">
        <label htmlFor="password" className="label">
          Password
        </label>
        <div className="login input-wrapper">
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
          <ul className="password-validation-list">
            {loginDataState.password.validations.map((validation, idx) => (
              <li
                key={idx}
                className={validation.isValid ? "valid" : "invalid"}
                style={{ color: validation.isValid ? "green" : "red" }}
              >
                {validation.message}
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

        {/* Password validation list */}
        {loginDataState.confirmPassword.validations.length > 0 && (
          <ul className="password-validation-list">
            {loginDataState.confirmPassword.validations.map(
              (validation, idx) => (
                <li
                  key={idx}
                  className={validation.isValid ? "valid" : "invalid"}
                  style={{ color: validation.isValid ? "green" : "red" }}
                >
                  {validation.message}
                </li>
              )
            )}
          </ul>
        )}
      </div>

      {/* Tup id Input */}
      <div>
        <label htmlFor="tupId" className="label">
          TUP ID
        </label>
        <div>
          {tupId.map((digit, index) => (
            <input
              key={index}
              id={`tup-id-input-${index}`}
              type="number"
              maxLength="1"
              value={digit}
              className="input tup-id-input"
              placeholder="-"
              required
              onChange={(e) => handleTupIdChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)} // Handle the Backspace key
              ref={(el) => (inputRefs.current[index] = el)} // Set the ref for each input
              style={{
                width: "40px",
                height: "40px",
                marginRight: "10px",
                textAlign: "center",
                fontSize: "20px",
                borderRadius: "5px",
                border: "2px solid #ccc",
                outline: "none",
                color: "black",
                backgroundColor: "#f9f9f9",
              }}
            />
          ))}
        </div>
      </div>

      {/* Image with Id Upload */}
      <div className="form-wrapper">
        <label htmlFor="imgWithId" className="label">
          Image with ID
        </label>
        <div className="login input-wrapper">
          <img className="icon" src={passwordIcon} alt="Password Icon" />
          <input
            id="imgWithId"
            className="input"
            placeholder="Confirm your password"
            required
            type="file"
            onChange={(e) =>
                onInputChange(
                  "imgWithId",
                  e.target.files,
                  dispatch,
                  loginDataState
                )
              }
              onBlur={(e) =>
                onBlur("imgWithId", e.target.files, dispatch, loginDataState)
              }
          />
        </div>
        {loginDataState.imgWithId.triggered &&
          loginDataState.imgWithId.hasError && (
            <div className="error">{loginDataState.imgWithId.error}</div>
          )}
      </div>

      {/* Scanned Id Upload */}
      <div className="form-wrapper">
        <label htmlFor="scannedId" className="label">
          Scanned ID
        </label>
        <div className="login input-wrapper">
          <img className="icon" src={passwordIcon} alt="Password Icon" />
          <input
            id="scannedId"
            className="input"
            placeholder="Confirm your password"
            required
            type="file"
            // value={loginDataState.scannedId.value}
            onChange={(e) =>
              onInputChange(
                "scannedId",
                e.target.files,
                dispatch,
                loginDataState
              )
            }
            onBlur={(e) =>
              onBlur("scannedId", e.target.files, dispatch, loginDataState)
            }
          />
        </div>
        {loginDataState.scannedId.triggered &&
          loginDataState.scannedId.hasError && (
            <div className="error">{loginDataState.scannedId.error}</div>
          )}
      </div>

      {/* Error message */}
      {errorMessage && <div className="error">{errorMessage}</div>}

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
