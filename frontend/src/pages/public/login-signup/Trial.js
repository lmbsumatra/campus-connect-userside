import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateField,
  blurField,
} from "../../../redux/signup-form/signupFormSlice";
import { Button, Dropdown } from "react-bootstrap";
import ShowPhotoWithIdAndScannedIdPolicy from "../../../trials/ShowPhotoWithIdAndScannedIdPolicy";
import emailIcon from "../../../assets/images/input-icons/email.svg";
import passwordIcon from "../../../assets/images/input-icons/password.svg";
import hidePasswordIcon from "../../../assets/images/input-icons/hide-password.svg";
import showPasswordIcon from "../../../assets/images/input-icons/show-password.svg";
import warningIcon from "../../../assets/images/input-icons/warning.svg";
import closeIcon from "../../../assets/images/input-icons/close.svg";
import userIcon from "../../../assets/images/input-icons/user.svg";
import infoIcon from "../../../assets/images/input-icons/info.svg";
import successIcon from "../../../assets/images/input-icons/success.svg";
import { baseApi } from "../../../App";
import ShowAlert from "../../../utils/ShowAlert";
import { useNavigate } from "react-router-dom";
import { saveUserData } from "../../../redux/auth/studentAuthSlice";

const Trial = ({ onTabClick }) => {
  const dispatch = useDispatch();
  const signupDataState = useSelector((state) => state.signupForm);
  const [step, setStep] = useState(1);
  const [isPasswordVisible, setPasswordVisible] = useState({
    password: false,
    confirmPassword: false,
  });
  const [showIdPolicyModal, setShowIdPolicyModal] = useState(false);
  const [idPolicyMessage, setIdPolicyMessage] = useState("");
  const [scannedId, setScannedId] = useState({
    file: null,
    blob: null,
    filename: "",
    filesize: 0,
  });
  const [imgWithId, setImgWithId] = useState({
    file: null,
    blob: null,
    filename: "",
    filesize: 0,
  });
  const [tupId, setTupId] = useState(Array(6).fill(""));
  const inputRefs = useRef([]);
  const imgWithIdInputRef = useRef(null);
  const scannedIdInputRef = useRef(null);
  const navigate = useNavigate();

  const handleShowIdPolicyModal = (message) => {
    setIdPolicyMessage(message);
    setShowIdPolicyModal(true);
  };
  const handleCloseIdPolicyModal = () => {
    setShowIdPolicyModal(false);
  };

  const handleInput = (name, value) => {
    dispatch(updateField({ name, value }));
  };

  const handleBlur = (name, value) => {
    dispatch(blurField({ name, value }));
  };

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

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && tupId[index] === "") {
      if (index > 0) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    ShowAlert(dispatch, "loading", "Loading", "We're working on it...");

    if (!signupDataState.isFormValid) {
      alert("Please correct the errors before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("first_name", signupDataState.firstName?.value || "");
    formData.append("middle_name", signupDataState.middleName?.value || "");
    formData.append("last_name", signupDataState.lastName?.value || "");
    formData.append("email", signupDataState.email?.value || "");
    formData.append("password", signupDataState.password?.value || "");
    formData.append("tup_id", tupId.join(""));
    formData.append("college", signupDataState.college?.value || "");
    formData.append("scanned_id", scannedId.file);
    formData.append("photo_with_id", imgWithId.file);
    formData.append("role", "student");

    try {
      const response = await fetch(`${baseApi}/user/register`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        await ShowAlert(
          dispatch,
          "success",
          "Success!",
          "Registered successfully!"
        );
        ShowAlert(dispatch, "loading", "Logging you in...");
        if (data.token && data.role && data.userId) {
          const loginData = {
            token: data.token,
            role: data.role,
            userId: data.userId,
          };
          dispatch(saveUserData(loginData));
          ShowAlert(dispatch, "success", "Logged in!");
          navigate("/");
        } else {
          ShowAlert(dispatch, "error", "Failed", "Please try to login again.");
        }
      } else {
        const errorData = await response.json();
        ShowAlert(
          dispatch,
          "error",
          "Failed",
          errorData.message || "Registration failed. Please try again."
        );
      }
    } catch (error) {
      console.error("Unexpected error during registration:", error); // Log the error
      ShowAlert(
        dispatch,
        "error",
        "Failed",
        "An unexpected error occurred. Please try again later."
      );
    }
  };

  const handleImageChange = (e, name) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const blobURL = URL.createObjectURL(file);
      const fileInfo = {
        file,
        blob: blobURL,
        filename: file.name,
        filesize: file.size,
      };

      if (name === "imgWithId") {
        setImgWithId(fileInfo);
      } else if (name === "scannedId") {
        setScannedId(fileInfo);
      }

      const fileDetails = {
        filename: file.name,
        filesize: file.size,
      };

      dispatch(updateField({ name, value: fileDetails }));
      dispatch(blurField({ name, value: fileDetails }));
    }
  };

  const handleRemoveImage = (name) => {
    if (name === "imgWithId") {
      if (imgWithIdInputRef.current) {
        imgWithIdInputRef.current.value = null; // Clear file input
      }
      setImgWithId({ file: null, blob: null, filename: "", filesize: 0 }); // Reset the image state
      dispatch(updateField({ name: "imgWithId", value: "" })); // Clear redux state
      dispatch(blurField({ name: "imgWithId", value: "" }));
    } else if (name === "scannedId") {
      if (scannedIdInputRef.current) {
        scannedIdInputRef.current.value = null; // Clear file input
      }
      setScannedId({ file: null, blob: null, filename: "", filesize: 0 }); // Reset the image state
      dispatch(updateField({ name: "scannedId", value: "" })); // Clear redux state
      dispatch(blurField({ name: "scannedId", value: "" }));
    }
  };

  const renderImageUpload = (name, label, policyMessage) => (
    <div className="field-container">
      <label htmlFor={name} className="label">
        {label}
        <Button
          variant="link"
          onClick={() => setShowIdPolicyModal(policyMessage)}
        >
          <img src={infoIcon} className="icon" alt="Information" />
        </Button>
      </label>
      <div className="image-input-wrapper">
        <label
          htmlFor={name}
          className={`image ${signupDataState[name].value ? "has-image" : ""}`}
        >
          {signupDataState[name].value ? (
            <>
              <img
                src={name === "imgWithId" ? imgWithId.blob : scannedId.blob}
                alt="Preview"
                className="preview"
              />
              <div className="hover-overlay">Click to change photo</div>
            </>
          ) : (
            <span className="placeholder-text">Click to upload photo</span>
          )}
        </label>
        <input
          id={name}
          type="file"
          accept="image/*"
          onChange={(e) => handleImageChange(e, name)}
          ref={name === "imgWithId" ? imgWithIdInputRef : scannedIdInputRef}
          onBlur={(e) => handleBlur(name, e.target.value)}
        />
        {signupDataState[name].value && (
          <button
            className="remove-button"
            onClick={() => handleRemoveImage(name)}
          >
            <img alt="Remove image" src={closeIcon} />
          </button>
        )}
      </div>
      {signupDataState[name].triggered && signupDataState[name].hasError && (
        <div className="validation error">
          <img src={warningIcon} className="icon" alt={`Error on ${name}`} />
          <span className="text">{signupDataState[name].error}</span>
        </div>
      )}
    </div>
  );

  const renderField = (name, type = "text", icon, placeholder) => (
    <div className="field-container">
      <label htmlFor={name} className="label">
        {name.charAt(0).toUpperCase() +
          name.slice(1).replace(/([A-Z])/g, " $1")}
      </label>
      <div className="input-wrapper">
        {icon && <img className="icon" src={icon} alt={`${name} icon`} />}
        <input
          id={name}
          type={
            ["password", "confirmPassword"].some((keyword) =>
              name.includes(keyword)
            )
              ? isPasswordVisible[name]
                ? "text"
                : "password"
              : type
          }
          className="input"
          placeholder={placeholder}
          value={signupDataState[name]?.value || ""}
          onChange={(e) => handleInput(name, e.target.value)}
          onBlur={(e) => handleBlur(name, e.target.value)}
        />
        {["password", "confirmPassword"].some((keyword) =>
          name.includes(keyword)
        ) && (
          <img
            className="password-toggle-icon"
            src={isPasswordVisible[name] ? showPasswordIcon : hidePasswordIcon}
            alt={`Toggle ${name} Visibility`}
            onClick={() =>
              setPasswordVisible((prevState) => ({
                ...prevState,
                [name]: !prevState[name],
              }))
            }
          />
        )}
      </div>
      {signupDataState[name]?.triggered && (
        <>
          {signupDataState[name]?.hasError && signupDataState[name]?.error && (
            <div className="validation error">
              <img
                src={warningIcon}
                className="icon"
                alt={`Error on ${name}`}
              />
              <span className="text">{signupDataState[name]?.error}</span>
            </div>
          )}
          {signupDataState[name]?.validations &&
            signupDataState[name]?.validations.length > 0 && (
              <ul className="list">
                {signupDataState[name]?.validations.map((validation, idx) => (
                  <li key={idx}>
                    <div
                      className={`validation ${
                        validation.isValid ? "success" : "error"
                      }`}
                    >
                      <img
                        src={validation.isValid ? successIcon : warningIcon}
                        className="icon"
                        alt="Validation status"
                      />
                      <span
                        className="text"
                        style={{ color: validation.isValid ? "green" : "red" }}
                      >
                        {validation.message}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
        </>
      )}
    </div>
  );

  const handleNextStep = () => {
    if (step < 4 && isStepValid()) setStep(step + 1);
    else {
      alert("please fill up completely!");
    }
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        // Check if the required fields have no errors and contain values
        return (
          signupDataState.firstName?.value &&
          signupDataState.lastName?.value &&
          !signupDataState.firstName?.hasError &&
          !signupDataState.middleName?.hasError &&
          !signupDataState.lastName?.hasError
        );
      case 2:
        // Check if Tup ID is fully filled and both images are uploaded
        return (
          tupId.every((digit) => digit !== "") &&
          imgWithId.filename &&
          scannedId.filename && signupDataState.college
        );
      case 3:
        // Check if email, password, and confirm password fields are valid and match
        return (
          signupDataState.email?.value &&
          signupDataState.password?.value &&
          signupDataState.confirmPassword?.value &&
          !signupDataState.email?.hasError &&
          !signupDataState.password?.hasError &&
          !signupDataState.confirmPassword?.hasError &&
          signupDataState.password?.value ===
            signupDataState.confirmPassword?.value
        );
      case 4:
        return true; // Verification step does not require validation
      default:
        return false;
    }
  };

  return (
    <div className="auth-container">
      {step === 1 && (
        <div>
          <h4>Personal Details</h4>
          {renderField("firstName", "text", userIcon, "Your First Name")}
          {renderField("middleName", "text", userIcon, "Your Middle Name")}
          {renderField("lastName", "text", userIcon, "Your Last Name")}
        </div>
      )}

      {step === 2 && (
        <div>
          <h4>School Details</h4>
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
                  placeholder="#"
                  required
                  onChange={(e) => handleTupIdChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)} // Handle the Backspace key
                  ref={(el) => (inputRefs.current[index] = el)}
                  onBlur={() => handleBlur("tupId", tupId.join(""))}
                />
              ))}
            </div>
            {signupDataState.tupId.triggered &&
              signupDataState.tupId.hasError && (
                <div className="validation error">
                  <img
                    src={warningIcon}
                    className="icon"
                    alt="Error on TUP ID"
                  />
                  <span className="text">{signupDataState.tupId.error}</span>
                </div>
              )}
          </div>
          <div className="field-container">
            <label htmlFor="college" className="label">
              College
            </label>
            <Dropdown
              onSelect={(eventKey) => handleInput("college", eventKey)} // Update Redux state
            >
              <Dropdown.Toggle
                id="college-dropdown"
                variant="success"
                className="w-100"
              >
                {signupDataState.college?.value || "Select your college"}
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
                <Dropdown.Item eventKey="COS">College of Science</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            {signupDataState.college.triggered &&
              signupDataState.college.hasError && (
                <div className="validation error">
                  <img
                    src={warningIcon}
                    className="icon"
                    alt="Error on college"
                  />
                  <span className="text">{signupDataState.college.error}</span>
                </div>
              )}
          </div>

          {renderImageUpload(
            "imgWithId",
            "Image with ID",
            "We collect a photo of you together with your ID to verify your identity"
          )}
          {renderImageUpload(
            "scannedId",
            "Scanned ID",
            "We ask for your ID to confirm your identity with official documentation"
          )}
        </div>
      )}

      {step === 3 && (
        <div>
          <h4>Account Details</h4>
          {renderField("email", "email", emailIcon, "Your Email")}
          {renderField("password", "password", passwordIcon, "Your Password")}
          {renderField(
            "confirmPassword",
            "password",
            passwordIcon,
            "Confirm Password"
          )}
        </div>
      )}

      {step === 4 && (
        <div>
          <h4>Verification</h4>
        </div>
      )}

      <div className="navigation-buttons">
        <button onClick={handlePrevStep} disabled={step === 1}>
          Previous
        </button>
        {step < 4 && <button onClick={handleNextStep}>Next</button>}
        {step === 4 && (
          <button
            onClick={handleSubmit}
            disabled={!signupDataState.isFormValid}
          >
            Submit
          </button>
        )}
      </div>

      <div className="or-divider">
        <span>or</span>
      </div>

      {/* Sign-up Link */}
      <p>
        Already have an account?{" "}
        <a className="link" onClick={() => onTabClick("loginTab")}>
          Login here!
        </a>
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
