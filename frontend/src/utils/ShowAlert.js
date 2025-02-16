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

    // Example: Simulate user closure or interaction with a timeout (if no callback exists)
    // setTimeout(() => {
    //   onClose();
    // }, 3000); // Example timeout
  });
};

export default ShowAlert;
