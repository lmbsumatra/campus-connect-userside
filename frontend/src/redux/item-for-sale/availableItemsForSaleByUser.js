import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { baseApi } from "../../utils/consonants";

const BASE_URL = `${baseApi}/item-for-sale/user`;

const initialState = {
  availableItemsForSaleByUser: [],
  loadingAvailableItemsForSaleByUser: false,
  errorAvailableItemsForSaleByUser: null,
};

export const fetchAvailableItemsForSaleByUser = createAsyncThunk(
  "listings/AvailableItemsForSaleByUser",
  async (userId) => {
    const response = await axios.get(`${BASE_URL}/${userId}/available`);
    // console.log(userId, response.data);
    return response.data;
  }
);

const availableItemsForSaleByUser = createSlice({
  name: "itemsforsale",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailableItemsForSaleByUser.pending, (state) => {
        state.loadingAvailableItemsForSaleByUser = true;
      })
      .addCase(fetchAvailableItemsForSaleByUser.fulfilled, (state, action) => {
        state.loadingAvailableItemsForSaleByUser = false;
        state.availableItemsForSaleByUser = action.payload;
      })
      .addCase(fetchAvailableItemsForSaleByUser.rejected, (state, action) => {
        state.loadingAvailableItemsForSaleByUser = false;
        state.errorAvailableItemsForSaleByUser = action.error.message;
      });
  },
});

export default availableItemsForSaleByUser.reducer;
