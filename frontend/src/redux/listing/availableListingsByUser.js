import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { baseApi } from "../../utils/consonants";

const BASE_URL = `${baseApi}/listings/user`;

const initialState = {
  availableListingsByUser: [],
  loadingAvailableListingsByUser: false,
  errorAvailableListingsByUser: null,
};

export const fetchAvailableListingsByUser = createAsyncThunk(
  "listings/AvailableListingsByUser",
  async (userId) => {
    const response = await axios.get(`${BASE_URL}/${userId}/available`);
    // console.log(userId, response.data);
    return response.data;
  }
);

const availableListingsByUser = createSlice({
  name: "listings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailableListingsByUser.pending, (state) => {
        state.loadingAvailableListingsByUser = true;
      })
      .addCase(fetchAvailableListingsByUser.fulfilled, (state, action) => {
        state.loadingAvailableListingsByUser = false;
        state.availableListingsByUser = action.payload;
      })
      .addCase(fetchAvailableListingsByUser.rejected, (state, action) => {
        state.loadingAvailableListingsByUser = false;
        state.errorAvailableListingsByUser = action.error.message;
      });
  },
});

export default availableListingsByUser.reducer;
