export const UPDATE_FORM = "UPDATE FORM";
export const onInputChange = (name, value, dispatch, itemDataState) => {
  const { hasError, error, validations } = validateInput(name, value);
  let isFormValid = true;

  // Validate the input fields dynamically on change
  for (const key in itemDataState) {
    const item = itemDataState[key];
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
    },
  });
};
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
      } else if (!(/^(?:\d{1,10}|\d{1,10}\.\d{1,2})$/.test(value))) {
        hasError = true;
        error =
          "Price should be whole number, can be decimal, and only up to 2 decimals.";
      } else {
        hasError = false;
        error = "";
      }
      break;

    case "availableDates":
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
      } else if (value !== "Pickup" || value !== "Meetup") {
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
      } else if (value !== "Payment upon meetup" || value !== "Gcash") {
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
      if (value.trim() === "") {
        hasError = true;
        error =
          "Late charges cannot be empty. Set as 0(zero) if you don't want to add.";
      } else if (/^(?:\d{1,10}|\d{1,10}\.\d{1,2})$/.test(value)) {
        hasError = true;
        error =
          "Late charges should be whole number, can be decimal, and only up to 2 decimals.";
      } else {
        hasError = false;
        error = "";
      }
      break;

    case "securityDeposit":
      if (value.trim() === "") {
        hasError = true;
        error =
          "Security deposit cannot be empty. Set as 0(zero) if you don't want to add.";
      } else if (/^(?:\d{1,10}|\d{1,10}\.\d{1,2})$/.test(value)) {
        hasError = true;
        error =
          "Security deposit should be whole number, can be decimal, and only up to 2 decimals.";
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

    case "tag":
      if (value.trim() === "") {
        hasError = true;
        error = "Tag is required.";
      } else if (value.lenth < 3) {
        hasError = true;
        error = "Add at least 3 tags.";
      } else {
        hasError = false;
        error = "";
      }
      break;
    case "specs":
      if (value.trim() === "") {
        hasError = true;
        error = "Specification is required.";
      } else if (value.lenth < 3) {
        hasError = true;
        error = "Add at least 3 specification.";
      } else {
        hasError = false;
        error = "";
      }
      break;
  }
  return { hasError, error };
};

// Helper function to validate available dates and durations
const validateAvailableDates = (availableDates) => {
  const errors = [];

  availableDates.forEach((dateObj, index) => {
    // Validate date format
    if (!isValidDate(dateObj.date)) {
      errors.push(`Invalid date format at index ${index + 1}: ${dateObj.date}`);
    }

    // Ensure unique durations for each date
    const durationsSet = new Set(dateObj.durations);
    if (durationsSet.size !== dateObj.durations.length) {
      errors.push(
        `Duplicate durations found for date ${dateObj.date} at index ${
          index + 1
        }`
      );
    }

    // Validate each duration
    dateObj.durations.forEach((duration, durationIndex) => {
      if (!isValidDuration(duration)) {
        errors.push(
          `Invalid duration format at index ${index + 1}, duration ${
            durationIndex + 1
          }: ${duration}`
        );
      } else {
        // Additional check: ensure the start time is earlier than the end time
        if (!isValidTimeRange(duration)) {
          errors.push(
            `Start time is not earlier than end time at index ${
              index + 1
            }, duration ${durationIndex + 1}: ${duration}`
          );
        }
      }
    });
  });

  return errors;
};

// Helper function to check if a date is valid
const isValidDate = (date) => {
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime()); // Returns true if the date is valid
};

// Helper function to validate the duration format (e.g., "9pm-11pm" or "10am-12pm")
const isValidDuration = (duration) => {
  const durationRegex = /^(?:\d{1,2}[ap]m)-(\d{1,2}[ap]m)$/;
  return durationRegex.test(duration);
};

// Helper function to check if a time range is valid (start time < end time)
const isValidTimeRange = (timeRange) => {
  const [startTime, endTime] = timeRange.split("-");

  // Convert time to 24-hour format for comparison
  const start = convertTo24Hour(startTime);
  const end = convertTo24Hour(endTime);

  // Check if start time is earlier than end time
  return start < end;
};

// Helper function to convert time (e.g., "9pm" or "10am") to 24-hour format
const convertTo24Hour = (time) => {
  const [hour, period] = time.match(/(\d{1,2})([ap]m)/).slice(1);
  let hourIn24 = parseInt(hour, 10);

  if (period === "pm" && hourIn24 !== 12) {
    hourIn24 += 12; // Convert PM times
  } else if (period === "am" && hourIn24 === 12) {
    hourIn24 = 0; // Convert 12am to 0
  }

  return hourIn24;
};

export const onBlur = (name, value, dispatch, itemDataState) => {
  console.log(name, value);
  const { hasError, error, validations } = validateInput(name, value);
  let isFormValid = true;
  console.log(name, value);

  for (const key in itemDataState) {
    const item = itemDataState[key];
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
    },
  });
};
