import ShowAlert from "./ShowAlert";

const handleUnavailableDateError = async (dispatch, error) => {
  if (error.response?.status === 403) {
    const errorMessage = error.response.data?.message || "Action not allowed.";
    const reason = error.response.data?.reason || "This date is unavailable.";

    await ShowAlert(
      dispatch,
      "error",
      "Action Unavailable",
      `${errorMessage} Reason: ${reason}`
    );
  } 
};

export default handleUnavailableDateError;
