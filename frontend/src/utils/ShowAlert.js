import { showNotification } from "../redux/alert-popup/alertPopupSlice";

const ShowAlert = (dispatch, type, title, text, customButton) => {
  return new Promise((resolve) => {
    const onClose = () => {
      resolve();
    };

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

    const handleClickOutside = (e) => {
      const alertContainer = document.querySelector(".alert-container");
      if (alertContainer && !alertContainer.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("click", handleClickOutside);

    const cleanup = () => {
      document.removeEventListener("click", handleClickOutside);
    };

    const timeoutId = setTimeout(() => {
      cleanup();
      onClose();
    }, 3000);
    const cleanupAlert = () => {
      clearTimeout(timeoutId);
      cleanup();
    };

    return cleanupAlert;
  });
};

export default ShowAlert;
