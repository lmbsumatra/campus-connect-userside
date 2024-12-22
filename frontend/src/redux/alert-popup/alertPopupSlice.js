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
      MySwal.fire({
        icon: type,
        title,
        text,
        timer,
        showConfirmButton: type === "loading" ? true : false,
      });

      if (type === "loading") {
        Swal.showLoading();
      }
    },
  },
});

export const { showNotification } = alertPopupSlice.actions;
export default alertPopupSlice.reducer;
