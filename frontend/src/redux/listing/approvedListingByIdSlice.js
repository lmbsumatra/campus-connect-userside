import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { baseApi } from "../../utils/consonants";

const BASE_URL = `${baseApi}/listings/available`;

const initialState = {
  approvedListingById: [],
  loadingApprovedListingById: false,
  errorApprovedListingById: null,
};

export const fetchApprovedListingById = createAsyncThunk(
  "listing/fetchApprovedListingById",
  async (id, { getState, rejectWithValue }) => {
    const state = getState();
    const { studentUser } = state.studentAuth || {};

    // Initialize URLSearchParams for query parameters
    const params = new URLSearchParams();
    if (studentUser && studentUser.userId) {
      params.append("userId", studentUser.userId);
    }

    // Construct the URL with query parameters if they exist
    let url = `${BASE_URL}/${id}`;
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const approvedListingByIdSlice = createSlice({
  name: "listing",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchApprovedListingById.pending, (state) => {
        state.loadingApprovedListingById = true;
      })
      .addCase(fetchApprovedListingById.fulfilled, (state, action) => {
        state.loadingApprovedListingById = false;
        state.approvedListingById = action.payload;
      })
      .addCase(fetchApprovedListingById.rejected, (state, action) => {
        state.loadingApprovedListingById = false;
        state.errorApprovedListingById = action.error.message;
      });
  },
});

export default approvedListingByIdSlice.reducer;
