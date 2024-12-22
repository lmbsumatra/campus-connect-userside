import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createSelector } from "reselect";
import axios from "axios";

const BASE_URL = "http://192.168.100.34:3001/item-for-sale/available";

const initialState = {
  approvedItemForSaleById: [],
  loadingApprovedItemForSaleById: false,
  errorApprovedItemForSaleById: null,
};

export const fetchApprovedItemForSaleById = createAsyncThunk(
  "item-for-sale/etchApprovedItemForSaleById",
  async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`);
    return response.json();
  }
);

const approvedItemForSaleByIdSlice = createSlice({
  name: "ittem-for-sale",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchApprovedItemForSaleById.pending, (state) => {
        state.loadingApprovedItemForSaleById = true;
      })
      .addCase(fetchApprovedItemForSaleById.fulfilled, (state, action) => {
        state.loadingApprovedItemForSaleById = false;
        state.approvedItemForSaleById = action.payload;
      })
      .addCase(fetchApprovedItemForSaleById.rejected, (state, action) => {
        state.loadingApprovedItemForSaleById = false;
        state.errorApprovedItemForSaleById = action.error.message;
      });
  },
});

export default approvedItemForSaleByIdSlice.reducer;