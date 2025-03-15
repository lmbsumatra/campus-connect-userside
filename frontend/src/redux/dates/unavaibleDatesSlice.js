import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "http://localhost:3001/admin/all-unavailable-dates";

const initialState = {
  unavailableDates: [],
  loadingUnavailableDates: false,
  errorUnavailableDates: null,
};

export const fetchUnavailableDates = createAsyncThunk(
  "dates/UnavailableDates",
  async () => {
    const response = await axios.get(BASE_URL);
    console.log(response.data);
    return response.data;
  }
);

const unavailableDates = createSlice({
  name: "unavailableDates",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnavailableDates.pending, (state) => {
        state.loadingUnavailableDates = true;
      })
      .addCase(fetchUnavailableDates.fulfilled, (state, action) => {
        state.loadingUnavailableDates = false;
        state.unavailableDates = action.payload;
        console.log(action.payload);
      })
      .addCase(fetchUnavailableDates.rejected, (state, action) => {
        state.loadingUnavailableDates = false;
        state.errorUnavailableDates = action.error.message;
      });
  },
});

export default unavailableDates.reducer;
