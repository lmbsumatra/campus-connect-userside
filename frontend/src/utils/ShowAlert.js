import { showNotification } from "../redux/alert-popup/alertPopupSlice";

const ShowAlert = (dispatch, type, title, text) => {
  return new Promise((resolve) => {
    // Dispatch the notification
    dispatch(showNotification({ type, title, text }));

    // Optionally, resolve the promise after a timeout or user interaction
    // For demonstration, assuming you wait for user acknowledgment via a callback
    const onClose = () => {
      // Code to handle when the alert is closed, e.g., using a callback from the notification system
      resolve();
    };

    // Example: Simulate user closure or interaction with a timeout (if no callback exists)
    setTimeout(() => {
      onClose();
    }, 3000); // Example timeout
  });
};

export default ShowAlert;
