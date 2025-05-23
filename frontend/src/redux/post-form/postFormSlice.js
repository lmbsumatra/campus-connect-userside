import { createSlice } from "@reduxjs/toolkit";
import {
  FOR_SALE,
  GCASH,
  MEET_UP,
  PAY_UPON_MEETUP,
  PICK_UP,
} from "../../utils/consonants";

const validateAvailableDates = (dates) => {
  const errors = [];

  if (!dates || dates.length === 0) {
    errors.push("At least one available date is required.");
    return errors;
  }

  const datesWithoutTime = dates.filter(
    (date) => !date.durations || date.durations.length === 0
  );
  if (datesWithoutTime.length > 0) {
    errors.push("Each selected date must have at least one time period.");
  }

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

      if (isTagsEmpty) {
        hasError = true;
        error = "Tag is required.";
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

        const [key, specValue] = entries[entries.length - 1] || [null, null];

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
            if (typeof fileName !== "string") {
              continue;
            }

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

  images: { value: [], triggered: false, hasError: false, error: "" },
  desc: { value: "", triggered: false, hasError: false, error: "" },
  tags: { value: [], triggered: false, hasError: false, error: "" },
  specs: { value: {}, triggered: false, hasError: false, error: "" },

  isFormValid: false,
};

const postFormSlice = createSlice({
  name: "post-form",
  initialState,
  reducers: {
    updateRequestDates: (state, action) => {
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

      state[name] = { value, hasError, error, triggered: false };

      state.isFormValid = Object.keys(state).every(
        (key) => key === "isFormValid" || !state[key].hasError
      );
    },
    blurField: (state, action) => {
      const { name, value } = action.payload;
      const { hasError, error } = validateInput(name, value);

      state[name] = { value, hasError, error, triggered: true };

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
          state[key].value = "";
          state[key].hasError = false;
          state[key].error = "";
          state[key].triggered = false;
        }
      });
      let itemData = action.payload;

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

      state.isFormValid = Object.keys(state).every(
        (key) => key === "isFormValid" || !state[key].hasError
      );
    },
    clearPostForm: (state) => {
      Object.keys(state).forEach((key) => {
        if (key !== "isFormValid") {
          state[key].value = "";
          state[key].hasError = false;
          state[key].error = "";
          state[key].triggered = false;
        }
      });
    },
  },
});

export const {
  updateField,
  blurField,
  updateRequestDates,
  populatePostData,
  clearPostForm,
  updateAvailableDates,
} = postFormSlice.actions;

export default postFormSlice.reducer;
