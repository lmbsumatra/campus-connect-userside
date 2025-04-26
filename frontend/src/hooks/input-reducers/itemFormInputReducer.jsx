export const UPDATE_FORM = "UPDATE FORM";

export const onInputChange = (name, value, dispatch, itemDataState) => {
  const { hasError, error } = validateInput(name, value);
  let isFormValid = true;

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
      const entries = Object.entries(value);
      const [key, specValue] = entries[entries.length - 1];

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

const validateAvailableDates = (availableDates) => {
  const errors = [];

  availableDates.forEach((dateObj, index) => {

    if (!isValidDate(dateObj.date)) {
      errors.push(`Invalid date format at index ${index + 1}: ${dateObj.date}`);
    }

    const durationsSet = new Set(dateObj.durations);
    if (durationsSet.size !== dateObj.durations.length) {
      errors.push(
        `Duplicate durations found for date ${dateObj.date} at index ${
          index + 1
        }`
      );
    }

    dateObj.durations.forEach((duration, durationIndex) => {
      if (!isValidDuration(duration)) {
        errors.push(
          `Invalid duration format at index ${index + 1}, duration ${
            durationIndex + 1
          }: ${duration}`
        );
      } else {
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

const isValidDate = (date) => {
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime()); 
};

const isValidDuration = (duration) => {
  const durationRegex = /^(?:\d{1,2}[ap]m)-(\d{1,2}[ap]m)$/;
  return durationRegex.test(duration);
};

const isValidTimeRange = (timeRange) => {
  const [startTime, endTime] = timeRange.split("-");

  const start = convertTo24Hour(startTime);
  const end = convertTo24Hour(endTime);

  return start < end;
};

const convertTo24Hour = (time) => {
  const [hour, period] = time.match(/(\d{1,2})([ap]m)/).slice(1);
  let hourIn24 = parseInt(hour, 10);

  if (period === "pm" && hourIn24 !== 12) {
    hourIn24 += 12; 
  } else if (period === "am" && hourIn24 === 12) {
    hourIn24 = 0; 
  }

  return hourIn24;
};

export const onBlur = (name, value, dispatch, itemDataState) => {
  const { hasError, error } = validateInput(name, value);
  let isFormValid = true;


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
