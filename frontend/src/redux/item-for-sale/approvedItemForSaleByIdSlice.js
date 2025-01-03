import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = "http://localhost:3001/item-for-sale/available";

const initialState = {
  approvedItemForSaleById: [],
  loadingApprovedItemForSaleById: false,
  errorApprovedItemForSaleById: null,
};

export const fetchApprovedItemForSaleById = createAsyncThunk(
  "item-for-sale/fetchApprovedItemForSaleById",
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