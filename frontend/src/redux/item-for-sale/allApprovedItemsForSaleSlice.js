import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseApi } from "../../utils/consonants";

const BASE_URL = `${baseApi}/item-for-sale/available`;

const initialState = {
  allApprovedItemForSale: [],
  loadingAllApprovedItemForSale: false,
  errorAllApprovedItemForSale: null,
};

export const fetchAllApprovedItemForSale = createAsyncThunk(
  "item-for-sale/allApprovedItemForSale",
  async (keyword = "") => {
    const url = keyword
      ? `${BASE_URL}?q=${encodeURIComponent(keyword)}`
      : BASE_URL;
    const response = await fetch(url);
    return response.json();
  }
);

const allApprovedItemForSaleSlice = createSlice({
  name: "item-for-sale",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllApprovedItemForSale.pending, (state) => {
        state.loadingAllApprovedItemForSale = true;
      })
      .addCase(fetchAllApprovedItemForSale.fulfilled, (state, action) => {
        state.loadingAllApprovedItemForSale = false;
        state.allApprovedItemForSale = action.payload;
      })
      .addCase(fetchAllApprovedItemForSale.rejected, (state, action) => {
        state.loadingAllApprovedItemForSale = false;
        state.errorAllApprovedItemForSale = action.error.message;
      });
  },
});

export default allApprovedItemForSaleSlice.reducer;
