import { createSlice } from "@reduxjs/toolkit";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const alertPopupSlice = createSlice({
  name: "notification",
  initialState: {},
  reducers: {
    showNotification: (_, { payload }) => {
      const { type, title, text, customButton } = payload;

      if (type === "loading") {
        MySwal.fire({
          icon: "info",
          title: title || "Loading...",
          text: text || "Please wait while we process...",
          showConfirmButton: false,
          container: "my-swal",
        });
        Swal.showLoading();
      } else {
        const options = {
          icon: type,
          title,
          text,
          showCancelButton: !!customButton,
          showCloseButton: !!customButton,
          showConfirmButton: true,
          confirmButtonText: "OK", // Default OK button
          container: "my-swal",
        };

        // Ensure custom button works properly
        if (customButton) {
          options.confirmButtonText = customButton.text || "OK";
          options.preConfirm = () => {
            if (customButton.action) {
              customButton.action();
            }
            return true;
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
