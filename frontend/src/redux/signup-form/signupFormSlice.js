import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  firstName: { value: "", triggered: false, hasError: true, error: "" },
  middleName: { value: "", triggered: false, hasError: true, error: "" },
  lastName: { value: "", triggered: false, hasError: true, error: "" },
  imgWithId: { value: "", triggered: false, hasError: true, error: "" },
  scannedId: { value: "", triggered: false, hasError: true, error: "" },
  email: { value: "", triggered: false, hasError: true, error: "" },
  college: { value: "", triggered: false, hasError: true, error: "" },
  course: { value: "", triggered: false, hasError: true, error: "" },
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
      } else if (/[^a-zA-Z0-9\s]/.test(value)) {
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
    case "confirmPassword":
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
    case "college":
      if (value.trim() === "") {
        hasError = true;
        error = "College cannot be empty.";
      }
      break;
    case "course":
      if (value.trim() === "") {
        hasError = true;
        error = "Course cannot be empty.";
      }
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
        error = "";
      }
      break;
    case "imgWithId":
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      const maxSize = 5 * 1024 * 1024;

      if (!value) {
        hasError = true;
        error = "A photo with your ID is required.";
      } else {
        const fileExtension = value.filename.split(".").pop().toLowerCase();
        const isValidExtension = allowedTypes.some((type) =>
          type.includes(fileExtension)
        );

        if (!isValidExtension) {
          hasError = true;
          error =
            "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.";
        } else if (value.filesize > maxSize) {
          hasError = true;
          error = "File size exceeds the 5MB limit.";
        }
      }
      break;

    case "scannedId":
      const scannedIdAllowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      const scannedIdMaxSize = 5 * 1024 * 1024;

      if (!value) {
        hasError = true;
        error = "Scan of your ID is required.";
      } else {
        const fileExtension = value.filename.split(".").pop().toLowerCase();
        const isValidExtension = scannedIdAllowedTypes.some((type) =>
          type.includes(fileExtension)
        );
        if (!isValidExtension) {
          hasError = true;
          error =
            "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.";
        } else if (value.filesize > scannedIdMaxSize) {
          hasError = true;
          error = "File size exceeds the 5MB limit.";
        }
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

      state.isFormValid = Object.keys(state).every((key) =>
        key === "isFormValid" || key === "triggered"
          ? true
          : !state[key].hasError
      );
    },
    blurField: (state, action) => {
      const { name, value } = action.payload;

      const password = state.password.value;
      const { hasError, error, validations } = validateInput(
        name,
        value,
        password
      );

      state[name] = {
        ...state[name],
        hasError,
        error,
        validations,
        triggered: true,
      };
      state.isFormValid = Object.keys(state).every((key) =>
        key === "isFormValid" || key === "triggered"
          ? true
          : !state[key].hasError
      );
    },
    resetSignupForm: (state) => {
      return initialState; // Reset the state to the initial state
    },
  },
});

export const { updateField, blurField, resetSignupForm } =
  signupFormSlice.actions;
export default signupFormSlice.reducer;
