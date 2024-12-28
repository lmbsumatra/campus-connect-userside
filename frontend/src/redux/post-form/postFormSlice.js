import { createSlice } from "@reduxjs/toolkit";

// Utility function to validate available dates
const validateAvailableDates = (dates) => {
  const errors = [];

  if (!dates || dates.length === 0) {
    errors.push("At least one available date is required.");
    return errors;
  }

  // Check if each date has at least one time period
  const datesWithoutTime = dates.filter(
    (date) => !date.timePeriods || date.timePeriods.length === 0
  );
  if (datesWithoutTime.length > 0) {
    errors.push("Each selected date must have at least one time period.");
  }

  // Validate time periods
  dates.forEach((dateItem) => {
    if (dateItem.timePeriods) {
      dateItem.timePeriods.forEach((period) => {
        if (!period.startTime || !period.endTime) {
          errors.push("Start and end times are required for all time periods.");
        } else if (period.startTime >= period.endTime) {
          errors.push("End time must be after start time.");
        }
      });
    }
  });

  // Check for overlapping time periods on the same date
  dates.forEach((dateItem) => {
    if (dateItem.timePeriods && dateItem.timePeriods.length > 1) {
      for (let i = 0; i < dateItem.timePeriods.length; i++) {
        for (let j = i + 1; j < dateItem.timePeriods.length; j++) {
          const period1 = dateItem.timePeriods[i];
          const period2 = dateItem.timePeriods[j];

          if (
            (period1.startTime <= period2.endTime &&
              period1.endTime >= period2.startTime) ||
            (period2.startTime <= period1.endTime &&
              period2.endTime >= period1.startTime)
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
export const validateInput = (name, value) => {
  let hasError = false;
  let error = "";
  switch (name) {
    case "category":
      if (value.trim() === "") {
        hasError = true;
        error = "Category :P be empty.";
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
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      const maxSize = 5 * 1024 * 1024; // 5MB limit

      if (!value || value.length === 0) {
        hasError = true;
        error = "At least one image is required.";
      } else if (value.length > 5) {
        hasError = true;
        error = "Maximum of 5 images only.";
      } else {
        for (const file of value) {
          if (!allowedTypes.includes(file.type)) {
            hasError = true;
            error =
              "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.";
            break;
          }
          if (file.size > maxSize) {
            hasError = true;
            error = "File size exceeds the 5MB limit.";
            break;
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
    updateAvailableDates: (state, action) => {
      const { hasError, error } = validateInput(
        "requestDates",
        action.payload
      );
      state.availableDates = {
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
  },
});

// Export actions
export const { updateField, blurField, updateAvailableDates } =
postFormSlice.actions;

// Export the reducer
export default postFormSlice.reducer;
