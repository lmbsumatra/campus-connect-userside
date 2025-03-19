import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = "http://localhost:3001/item-for-sale/available";

const initialState = {
  approvedItemForSaleById: [],
  loadingApprovedItemForSaleById: false,
  errorApprovedItemForSaleById: null,
};

export const fetchApprovedItemForSaleById = createAsyncThunk(
  "item-for-sale/fetchApprovedItemForSaleById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}`);

      if (!response.ok) {
        // If response is not OK (404, 500, etc.), throw error
        const errorMessage = `Error ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      return await response.json(); // Return valid data
    } catch (error) {
      return rejectWithValue(error.message); // Pass error to Redux state
    }
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
