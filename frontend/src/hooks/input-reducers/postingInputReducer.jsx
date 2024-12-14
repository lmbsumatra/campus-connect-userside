export const UPDATE_POSTING_FORM = "UPDATE_POSTING_FORM";

export const onInputChange = (name, value, dispatch, postingDataState) => {
  // For file inputs (like imgWithId and scannedId), handle differently.
  if (name === "imgWithId" || name === "scannedId") {
    value = value[0]; // Take the first file from the FileList
  }

  const { hasError, error, validations } = validateInput(name, value);
  let isFormValid = true;

  // Validate the input fields dynamically on change
  for (const key in postingDataState) {
    const item = postingDataState[key];
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
    type: UPDATE_POSTING_FORM,
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

export const validateInput = (name, value) => {
  let hasError = false;
  let error = "";

  switch (name) {
    case "itemName":
      if (value.length == 0) {
        error = "Item name is required";
        hasError = true;
      }else if (value.length <= 3) {
        error = "Item name must be longer than 3";
        hasError = true;
      } else if (/[^a-zA-Z0-9]/.test(value)) {
        error = "Item name should be text only";
        hasError = true;
      }
      break;
  }
  return { hasError, error };
};

export const onBlur = (name, value, dispatch, postingDataState) => {
  const { hasError, error, validations } = validateInput(name, value);
  let isFormValid = true;

  for (const key in postingDataState) {
    const item = postingDataState[key];
    if (key === name && hasError) {
      isFormValid = false;
      break;
    } else if (key !== name && item.hasError) {
      isFormValid = false;
      break;
    }
  }

  dispatch({
    type: UPDATE_POSTING_FORM,
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
