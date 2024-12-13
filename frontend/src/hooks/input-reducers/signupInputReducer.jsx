export const UPDATE_FORM = "UPDATE FORM";

export const onInputChange = (name, value, dispatch, loginDataState) => {
  // For file inputs (like imgWithId and scannedId), handle differently.
  if (name === "imgWithId" || name === "scannedId") {
    value = value[0]; // Take the first file from the FileList
  }

  const { hasError, error, validations } = validateInput(
    name,
    value,
    loginDataState.password.value
  );
  let isFormValid = true;

  // Validate the input fields dynamically on change
  for (const key in loginDataState) {
    const item = loginDataState[key];
    if (key === name && hasError) {
      isFormValid = false;
      break;
    } else if (key !== name && item.hasError) {
      isFormValid = false;
      break;
    }
  }

  // Dispatch to update state for the specific field
  dispatch({
    type: UPDATE_FORM,
    data: {
      name,
      value,
      hasError,
      error,
      triggered: true,
      isFormValid,
      validations,
    },
  });
};

export const validateInput = (name, value, password) => {
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
      if (value === "") {
        hasError = true;
        error = "TUP Id is required";
      } else if (/[^0-9]/.test(value)) {
        hasError = true;
        error = "TUP Id contains non-digit characters";
      } else if (value.length !== 6) {
        hasError = true;
        error = "TUP Id incomplete";
      } else if (/^\d{6}$/.test(value)) {
        console.log("TUP Id is a valid 6-digit number:", value);
      } else {
        hasError = true;
        error = "TUP Id is not a valid 6-digit number";
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
export const onBlur = (name, value, dispatch, loginDataState) => {
  const { hasError, error, validations } = validateInput(
    name,
    value,
    loginDataState.password.value
  );
  let isFormValid = true;

  for (const key in loginDataState) {
    const item = loginDataState[key];
    if (key === name && hasError) {
      isFormValid = false;
      break;
    } else if (key !== name && item.hasError) {
      isFormValid = false;
      break;
    }
  }

  dispatch({
    type: UPDATE_FORM,
    data: {
      name,
      value,
      hasError,
      error,
      triggered: true,
      isFormValid,
      validations,
    },
  });
};
