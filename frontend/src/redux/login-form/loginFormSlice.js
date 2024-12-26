import { createSlice } from "@reduxjs/toolkit";

// Utility function for input validation
const validateInput = (name, value) => {
  let hasError = false;
  let error = "";

  switch (name) {
    case "email":
      if (value.trim() === "") {
        hasError = true;
        error = "Email cannot be empty.";
      } else if (/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) {
        hasError = false;
        error = "null";
      } else {
        hasError = true;
        error = "Invalid email";
      }
      break;
    case "password":
      if (value.trim() === "") {
        hasError = true;
        error = "Password cannot be empty.";
      }
      break;
    default:
      break;
  }

  return { hasError, error };
};

// Initial state
const initialState = {
  email: { value: "", hasError: false, error: "", triggered: false },
  password: { value: "", hasError: false, error: "", triggered: false },
  isFormValid: false,
};

// Create a slice for the form
const loginFormSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    updateField: (state, action) => {
      const { name, value } = action.payload;
      const { hasError, error } = validateInput(name, value);

      // Update the field
      state[name] = { value, hasError, error, triggered: false };

      // Recalculate form validity
      state.isFormValid = Object.keys(state).every(
        (key) => key === "isFormValid" || !state[key].hasError
      );
    },
    blurField: (state, action) => {
      const { name, value } = action.payload;
      const { hasError, error } = validateInput(name, value);

      // Update the field on blur
      state[name] = { value, hasError, error, triggered: true };

      // Recalculate form validity
      state.isFormValid = Object.keys(state).every(
        (key) => key === "isFormValid" || !state[key].hasError
      );
    },
  },
});

// Export actions
export const { updateField, blurField } = loginFormSlice.actions;

// Export the reducer
export default loginFormSlice.reducer;
