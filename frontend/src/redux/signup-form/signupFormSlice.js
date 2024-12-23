import { createSlice } from "@reduxjs/toolkit";

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

const validateInput = (name, value, password) => {
  let hasError = false;
  let error = "";
  let validations = [];

  switch (name) {
    case "firstName":
      if (value.trim() === "") {
        hasError = true;
        error = "First name cannot be empty.";
      } else if (/[^a-zA-Z0-9]/.test(value)) {
        hasError = true;
        error = "First name cannot have special character.";
      } else if (/\d/.test(value)) {
        hasError = true;
        error = "First name cannot have number.";
      }
      break;
    case "middleName":
      if (value.trim() === "") {
        hasError = false;
        error = "Middle name is optional.";
      } else if (/[^a-zA-Z0-9]/.test(value)) {
        hasError = true;
        error = "Middle name cannot have special character.";
      } else if (/\d/.test(value)) {
        hasError = true;
        error = "Middle name cannot have number.";
      }
      break;
    case "lastName":
      if (value.trim() === "") {
        hasError = true;
        error = "Last name cannot be empty.";
      } else if (/[^a-zA-Z0-9]/.test(value)) {
        hasError = true;
        error = "Last name cannot have special character.";
      } else if (/\d/.test(value)) {
        hasError = true;
        error = "Last name cannot have number.";
      }
      break;
    case "email":
      if (value.trim() === "") {
        hasError = true;
        error = "Email cannot be empty.";
      } else if (
        !/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(
          value
        )
      ) {
        hasError = true;
        error = "Invalid email.";
      } else {
        hasError = false;
        error = "";
      }
      break;
    case "password":
      // Password validation
      const isNotEmpty = value.trim() !== "";
      const isMinLength = value.length >= 8;
      const hasUppercase = /[A-Z]/.test(value);
      const hasLowercase = /[a-z]/.test(value);
      const hasDigit = /\d/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      console.log(isNotEmpty)
      validations.push({
        message: "Password is required",
        isValid: isNotEmpty,
      });
      
      validations.push({
        message: "At least 8 characters",
        isValid: isMinLength,
      });
      validations.push({
        message: "At least one uppercase letter",
        isValid: hasUppercase,
      });
      validations.push({
        message: "At least one lowercase letter",
        isValid: hasLowercase,
      });
      validations.push({
        message: "At least one digit",
        isValid: hasDigit,
      });
      validations.push({
        message: "At least one special character",
        isValid: hasSpecialChar,
      });

      hasError =
        !isMinLength ||
        !hasUppercase ||
        !hasLowercase ||
        !hasDigit ||
        !hasSpecialChar;
      break;
    // Add other fields validation here
    case "confirmPassword":
      // Password validation
      const isConfirmPasswordNotEmpty = value.trim() !== "";
      const isPasswordEmpty = password.length !== 0;
      const isPasswordEqual = value === password;

      validations.push({
        message: "Confirm password is required",
        isValid: isConfirmPasswordNotEmpty,
      });
      if (!isPasswordEmpty) {
        validations.push({
          message: "Enter password first",
          isValid: isPasswordEmpty,
        });
      } else if (isPasswordEmpty) {
        validations.push({
          message: "Should match the password.",
          isValid: isPasswordEqual,
        });
      }

      hasError = !isConfirmPasswordNotEmpty || !isPasswordEqual;
      break;
    case "tupId":
      if (value.length === 0) {
        hasError = true;
        error = "TUP Id is required";
      } else if (/[^0-9]/.test(value)) {
        hasError = true;
        error = "TUP Id contains non-digit characters";
      } else if (value.length < 6) {
        hasError = true;
        error = "TUP Id incomplete";
      } else {
        hasError = false;
        error = ""; // Reset error when TUP Id is valid
      }
      break;

    case "imgWithId":
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      const maxSize = 5 * 1024 * 1024;
      if (!value) {
        hasError = true;
        error = "A photo with your Id is required.";
      } else if (!allowedTypes.includes(value.type)) {
        hasError = true;
        error = "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.";
      } else if (value.size > maxSize) {
        hasError = true;
        error = "File size exceeds the 5MB limit.";
      }
      break;
    case "scannedId":
      const scannedIdAllowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      const scannedIdMaxSize = 5 * 1024 * 1024;
      if (!value) {
        hasError = true;
        error = "Scan of your Id is required.";
      } else if (scannedIdAllowedTypes.includes(value.type) === false) {
        hasError = true;
        error = "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.";
      } else if (value.size > scannedIdMaxSize) {
        hasError = true;
        error = "File size exceeds the 5MB limit.";
      }
      break;
    default:
      break;
  }
  return { hasError, error, validations };
};

const signupFormSlice = createSlice({
  name: "signup",
  initialState,
  reducers: {
    updateField: (state, action) => {
      const { name, value } = action.payload;

      // Call validateInput with password for consistency
      const password = state.password.value;
      const { hasError, error, validations } = validateInput(
        name,
        value,
        password
      );

      state[name] = {
        ...state[name],
        value,
        hasError,
        error,
        validations,
        triggered: true,
      };

      // Recalculate form validity
      state.isFormValid = Object.keys(state).every((key) =>
        key === "isFormValid" || key === "triggered"
          ? true
          : !state[key].hasError
      );
    },
    blurField: (state, action) => {
      const { name, value } = action.payload;

      // Call validateInput with password for consistency

      const password = state.password.value;
      console.log(state.password.value)
      const { hasError, error, validations } = validateInput(name, value, password);

      state[name] = {
        ...state[name],
        hasError,
        error,
        validations,
        triggered: true,
      };

      // Recalculate form validity
      state.isFormValid = Object.keys(state).every((key) =>
        key === "isFormValid" || key === "triggered"
          ? true
          : !state[key].hasError
      );
    },
  },
});

export const { updateField, blurField } = signupFormSlice.actions;
export default signupFormSlice.reducer;
