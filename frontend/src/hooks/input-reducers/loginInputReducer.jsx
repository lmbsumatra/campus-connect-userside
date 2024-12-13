export const UPDATE_FORM = "UPDATE FORM";

export const onInputChange = (name, value, dispatch, loginDataState) => {
  const { hasError, error } = validateInput(name, value);
  let isFormValid = true;

  for (const key in loginDataState) {
    const item = loginDataState[key];
    // Check if current field has error
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
    data: { name, value, hasError, error, triggered: false, isFormValid },
  });
};

export const validateInput = (name, value) => {
  let hasError = false;
  let error = "";
  switch (name) {
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
      if (value.trim() === "") {
        hasError = true;
        error = "Password cannot be empty.";
      } else {
        hasError = false;
        error = "";
      }
      break;
  }
  return { hasError, error };
};

export const onBlur = (name, value, dispatch, loginDataState) => {
  const { hasError, error } = validateInput(name, value);
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
    data: { name, value, hasError, error, triggered: true, isFormValid },
  });
};
