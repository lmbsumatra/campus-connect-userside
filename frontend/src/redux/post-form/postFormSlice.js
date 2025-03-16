import { createSlice } from "@reduxjs/toolkit";
import {
  FOR_SALE,
  GCASH,
  MEET_UP,
  PAY_UPON_MEETUP,
  PICK_UP,
} from "../../utils/consonants";

// Utility function to validate available dates
const validateAvailableDates = (dates) => {
  const errors = [];

  if (!dates || dates.length === 0) {
    errors.push("At least one available date is required.");
    return errors;
  }

  // Check if each date has at least one time period
  const datesWithoutTime = dates.filter(
    (date) => !date.durations || date.durations.length === 0
  );
  if (datesWithoutTime.length > 0) {
    errors.push("Each selected date must have at least one time period.");
  }

  // Validate time periods
  dates.forEach((dateItem) => {
    if (dateItem.durations) {
      dateItem.durations.forEach((period) => {
        if (!period.timeFrom || !period.timeTo) {
          errors.push("Start and end times are required for all time periods.");
        } else if (period.timeFrom >= period.timeTo) {
          errors.push("End time must be after start time.");
        }
      });
    }
  });

  // Check for overlapping time periods on the same date
  dates.forEach((dateItem) => {
    if (dateItem.durations && dateItem.durations.length > 1) {
      for (let i = 0; i < dateItem.durations.length; i++) {
        for (let j = i + 1; j < dateItem.durations.length; j++) {
          const period1 = dateItem.durations[i];
          const period2 = dateItem.durations[j];

          if (
            (period1.timeFrom <= period2.timeTo &&
              period1.timeTo >= period2.timeFrom) ||
            (period2.timeFrom <= period1.timeTo &&
              period2.timeTo >= period1.timeFrom)
          ) {
            errors.push("Time periods cannot overlap on the same date.");
            break;
          }
        }
      }
    }
  });

  return errors;
};

// Utility function for input validation
export const validateInput = (name, value, itemType) => {
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

    case "requestDates":
      const dateValidation = validateAvailableDates(value);
      if (dateValidation.length > 0) {
        hasError = true;
        error = dateValidation.join(" ");
      } else {
        hasError = false;
        error = "";
      }
      break;

    case "deliveryMethod":
      if (value.trim() === "") {
        hasError = true;
        error = "Delivery method cannot be empty.";
      } else if (value !== PICK_UP && value !== MEET_UP) {
        // Changed to AND
        console.log(value, PICK_UP, MEET_UP);
        hasError = true;
        error = "Please choose between pickup and meetup only.";
      } else {
        hasError = false;
        error = "";
      }
      break;

    case "paymentMethod":
      if (value.trim() === "") {
        hasError = true;
        error = "Payment method cannot be empty.";
      } else if (value !== PAY_UPON_MEETUP && value !== GCASH) {
        // Changed to AND
        hasError = true;
        error = "Please choose between Payment upon meetup and Gcash only.";
      } else {
        hasError = false;
        error = "";
      }
      break;
    case "itemCondition":
      if (value.trim() === "") {
        hasError = true;
        error = "Item condition cannot be empty.";
      } else {
        hasError = false;
        error = "";
      }
      break;

    case "lateCharges":
      if (itemType === FOR_SALE) break;
      if (value.trim() === "") {
        hasError = true;
        error =
          "Late charges cannot be empty. Set as 0(zero) if you don't want to add.";
      } else if (!/^(?:\d{1,10}|\d{1,10}\.\d{1,2})$/.test(value)) {
        hasError = true;
        error =
          "Late charges should be whole number, can be decimal, and only up to 2 decimals.";
      } else {
        hasError = false;
        error = "";
      }
      break;

    case "securityDeposit":
      if (itemType === FOR_SALE) break;
      if (value.trim() === "") {
        hasError = true;
        error =
          "Security deposit cannot be empty. Set as 0(zero) if you don't want to add.";
      } else if (!/^(?:\d{1,10}|\d{1,10}\.\d{1,2})$/.test(value)) {
        hasError = true;
        error =
          "Security deposit should be whole number, can be decimal, and only up to 2 decimals.";
      } else {
        hasError = false;
        error = "";
      }
      break;

    case "repairReplacement":
      if (itemType === FOR_SALE) break;
      if (value.trim() === "") {
        hasError = true;
        error = "Repair and replacement condition is required.";
      } else {
        hasError = false;
        error = "";
      }
      break;
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
      if (
        !value ||
        typeof value !== "object" ||
        Object.keys(value).length === 0
      ) {
        hasError = true;
        error = "Both key and value are required.";
      } else {
        const entries = Object.entries(value);

        // Get the last entry
        const [key, specValue] = entries[entries.length - 1] || [null, null];

        // Validate key and specValue
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
      }
      break;
    case "images": {
      // First, ensure value is an array we can work with
      if (!Array.isArray(value)) {
        hasError = true;
        error = "Invalid image data format";
        break;
      }

      const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"];

      if (value.length === 0) {
        hasError = true;
        error = "At least one image is required.";
      } else if (value.length > 5) {
        hasError = true;
        error = "Maximum of 5 images only.";
      } else {
        for (const fileName of value) {
          try {
            // Skip validation for non-string values
            if (typeof fileName !== "string") {
              continue;
            }

            // Make sure the filename has an extension
            if (!fileName.includes(".")) {
              continue;
            }

            const fileExtension = fileName.split(".").pop().toLowerCase();

            if (!allowedExtensions.includes(fileExtension)) {
              hasError = true;
              error =
                "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.";
              break;
            }
          } catch (err) {
            console.error("Error validating file:", fileName, err);
            // Continue instead of breaking to allow other valid files
            continue;
          }
        }
      }
      break;
    }
    default:
      hasError = false;
      error = "";
      break;
  }

  return { hasError, error };
};

// Initial state
const initialState = {
  category: { value: "", triggered: false, hasError: false, error: "" },
  itemName: { value: "", triggered: false, hasError: false, error: "" },
  itemType: { value: "", triggered: false, hasError: false, error: "" },
  requestDates: {
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
    updateRequestDates: (state, action) => {
      console.log(action.payload);
      const { hasError, error } = validateInput("requestDates", action.payload);
      state.requestDates = {
        value: action.payload,
        hasError,
        error,
        triggered: true,
      };
    },
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
    updateAvailableDates: (state, action) => {
      const { hasError, error } = validateInput("requestDates", action.payload);
      state.requestDates = {
        value: action.payload,
        hasError,
        error,
        triggered: true,
      };
    },
    populatePostData: (state, action) => {
      Object.keys(state).forEach((key) => {
        if (key !== "isFormValid") {
          // Don't touch isFormValid here
          state[key].value = "";
          state[key].hasError = false;
          state[key].error = "";
          state[key].triggered = false;
        }
      });
      let itemData = action.payload;

      // Now itemData is guaranteed to be an object
      Object.keys(itemData).forEach((key) => {
        if (state[key] !== undefined) {
          state[key] = {
            value: itemData[key],
            hasError: false,
            error: "",
            triggered: false,
          };
        }
      });

      // Recalculate form validity
      state.isFormValid = Object.keys(state).every(
        (key) => key === "isFormValid" || !state[key].hasError
      );
    },
    // Clear the form fields but retain structure
    clearPostForm: (state) => {
      Object.keys(state).forEach((key) => {
        if (key !== "isFormValid") {
          // Don't touch isFormValid here
          state[key].value = "";
          state[key].hasError = false;
          state[key].error = "";
          state[key].triggered = false;
        }
      });
    },
  },
});

// Export actions
export const {
  updateField,
  blurField,
  updateRequestDates,
  populatePostData,
  clearPostForm,
  updateAvailableDates,
} = postFormSlice.actions;

// Export the reducer
export default postFormSlice.reducer;
