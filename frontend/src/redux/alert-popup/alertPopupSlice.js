import { createSlice } from "@reduxjs/toolkit";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const alertPopupSlice = createSlice({
  name: "notification",
  initialState: {},
  reducers: {
    showNotification: (_, { payload }) => {
      const { type, title, text, timer = 2000 } = payload;
      if (type === "loading") {
        MySwal.fire({
          icon: "info",
          title: title || "Loading...",
          text: text || "Please wait while we process...",
          timer: timer,
          showConfirmButton: false, // Hide confirm button during loading
        });

        Swal.showLoading();
      } else {
        MySwal.fire({
          icon: type,
          title,
          text,
          timer,
          showConfirmButton: type === "loading" ? false : true,
        });
      }
    },

    clearNotification: () => {
      Swal.close(); // Close any active SweetAlert notification
    },
  },
});

export const { showNotification, clearNotification } = alertPopupSlice.actions;
export default alertPopupSlice.reducer;
