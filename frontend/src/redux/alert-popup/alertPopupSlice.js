import { createSlice } from "@reduxjs/toolkit";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const alertPopupSlice = createSlice({
  name: "notification",
  initialState: {},
  reducers: {
    showNotification: (_, { payload }) => {
      const { type, title, text, customButton } = payload; // Added customButton
      if (type === "loading") {
        MySwal.fire({
          icon: "info",
          title: title || "Loading...",
          text: text || "Please wait while we process...",
          showConfirmButton: false,
        });
        Swal.showLoading();
      } else {
        const options = {
          icon: type,
          title,
          text,
          showCancelButton: !!customButton, // Show cancel button if customButton exists
          showCloseButton: !!customButton,
          showConfirmButton: true,
        };

        if (customButton) {
          options.confirmButtonText = customButton.text; // Set custom button text
          options.preConfirm = () => {
            // Call the custom action when the button is clicked
            if (customButton.action) {
              customButton.action(); // Execute custom action
            }
            return true; // Resolve the promise
          };
        }

        MySwal.fire(options);
      }
    },

    clearNotification: () => {
      Swal.close(); // Close any active SweetAlert notification
    },
  },
});

export const { showNotification, clearNotification } = alertPopupSlice.actions;
export default alertPopupSlice.reducer;
