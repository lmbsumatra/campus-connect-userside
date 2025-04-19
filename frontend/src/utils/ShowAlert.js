import { showNotification } from "../redux/alert-popup/alertPopupSlice";

const ShowAlert = (dispatch, type, title, text, customButton) => {
  return new Promise((resolve) => {
    const onClose = () => {
      resolve();
    };

    // Dispatch the notification with optional custom button
    dispatch(
      showNotification({
        type,
        title,
        text,
        customButton: {
          ...customButton,
          action: () => {
            if (customButton?.action) {
              customButton.action();
            }
            onClose();
          },
        },
      })
    );

    // Add a click outside listener
    const handleClickOutside = (e) => {
      // Get the alert container
      const alertContainer = document.querySelector('.alert-container');
      if (alertContainer && !alertContainer.contains(e.target)) {
        // If clicked outside the alert, resolve the promise and close
        onClose();
      }
    };

    // Add the listener to document
    document.addEventListener("click", handleClickOutside);

    // Cleanup listener on component unmount
    const cleanup = () => {
      document.removeEventListener("click", handleClickOutside);
    };

    // Resolve on manual timeout (in case no user interaction)
    const timeoutId = setTimeout(() => {
      cleanup();
      onClose();
    }, 3000); // Timeout after 3 seconds if not closed by user

    // Cleanup on alert closure
    const cleanupAlert = () => {
      clearTimeout(timeoutId);
      cleanup();
    };

    // Return cleanup function in case needed (e.g., on component unmount)
    return cleanupAlert;
  });
};

export default ShowAlert;
