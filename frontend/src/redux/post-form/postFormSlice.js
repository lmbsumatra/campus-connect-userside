import { createSlice } from "@reduxjs/toolkit";

// Utility function for input validation
export const validateInput = (name, value) => {
  let hasError = false;
  let error = "";
  switch (name) {
    case "category":
      if (value.trim() === "") {
        hasError = true;
        error = "Category cannot be empty.";
      } else {
        hasError = false;
        error = "";
      }
      break;

    case "itemName":
      if (value.trim() === "") {
        hasError = true;
        error = "Item name cannot be empty.";
      } else {
        hasError = false;
        error = "";
      }
      break;

    case "price":
      if (value.trim() === "") {
        hasError = true;
        error = "Price cannot be empty.";
      } else if (!/^(?:\d{1,10}|\d{1,10}\.\d{1,2})$/.test(value)) {
        hasError = true;
        error =
          "Price should be whole number, can be decimal, and only up to 2 decimals.";
      } else {
        hasError = false;
        error = "";
      }
      break;

    // case "availableDates":
    //   const dateValidation = validateAvailableDates(value);
    //   if (dateValidation.length > 0) {
    //     hasError = true;
    //     error = dateValidation.join(" ");
    //   } else {
    //     hasError = false;
    //     error = "";
    //   }
    //   break;

    case "desc":
      if (value.trim() === "") {
        hasError = true;
        error = "Item description is required.";
      } else {
        hasError = false;
        error = "";
      }
      break;

    case "tags":
      const isTagsEmpty = value.length === 0;
      const isTagsLessThan3 = value.length < 3;
      console.log(isTagsEmpty, isTagsLessThan3, value.length);
      if (isTagsEmpty) {
        hasError = true;
        error = "Tag is required.";
        console.log(isTagsEmpty, error, hasError);
      } else if (value.length < 3) {
        hasError = true;
        error = "Add at least 3 tags.";
      } else {
        hasError = false;
        error = "";
      }
      break;
    case "specs":
      const entries = Object.entries(value);
      const [key, specValue] = entries[entries.length - 1];

      // Check if key or specValue are undefined or empty
      if (!key || !specValue || !key.trim() || !specValue.trim()) {
        hasError = true;
        error = "Both key and value are required.";
      } else if (key.length > 50) {
        hasError = true;
        error = "Key cannot exceed 50 characters.";
      } else if (specValue.length > 100) {
        hasError = true;
        error = "Value cannot exceed 100 characters.";
      } else if (!/^[a-zA-Z0-9 _-]+$/.test(key)) {
        hasError = true;
        error = "Key contains invalid characters.";
      } else if (!/^[a-zA-Z0-9 _.,-]+$/.test(specValue)) {
        hasError = true;
        error = "Value contains invalid characters.";
      } else {
        hasError = false;
        error = "";
      }
      break;
  }
  return { hasError, error };
};

// Initial state
const initialState = {
    category: { value: "", triggered: false, hasError: false, error: "" },
    itemName: { value: "", triggered: false, hasError: false, error: "" },
    itemType: { value: "", triggered: false, hasError: false, error: "" },
    rentalDates: {
      value: [],
      triggered: false,
      hasError: false,
      error: "",
    },
    images: { value: [], triggered: false, hasError: false, error: "" }, // Array of images
    desc: { value: "", triggered: false, hasError: false, error: "" }, // Array of tags
    tags: { value: [], triggered: false, hasError: false, error: "" }, // Array of tags
    specs: { value: {}, triggered: false, hasError: false, error: "" }, // Object for specs
  
    isFormValid: false,
  };

// Create a slice for the form
const postFormSlice = createSlice({
  name: "post-form",
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
export const { updateField, blurField } = postFormSlice.actions;

// Export the reducer
export default postFormSlice.reducer;
