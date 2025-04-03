import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { baseApi } from "../../utils/consonants";

// Base URL for transaction reports API
const BASE_URL = `${baseApi}/api/transaction-reports`;

// Thunk to fetch all transaction reports by a user (either as reporter or reported)
export const fetchTransactionReportsByUser = createAsyncThunk(
  "transactionReportsByUser/fetchAll",
  async ({ userId, token }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching transaction reports for user ${userId}:`,
        error
      );
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    }
  }
);

// Thunk to delete a transaction report
export const deleteTransactionReport = createAsyncThunk(
  "transactionReportsByUser/delete",
  async ({ userId, token, reportId }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${BASE_URL}/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return reportId; // Return the ID for state updates
    } catch (error) {
      console.error(`Error deleting transaction report ${reportId}:`, error);
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    }
  }
);

// Slice definition
const transactionReportsByUserSlice = createSlice({
  name: "transactionReportsByUser",
  initialState: {
    transactionReportsByUser: [],
    loadingTransactionReportsByUser: false,
    errorTransactionReportsByUser: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle fetchTransactionReportsByUser
      .addCase(fetchTransactionReportsByUser.pending, (state) => {
        state.loadingTransactionReportsByUser = true;
        state.errorTransactionReportsByUser = null;
      })
      .addCase(fetchTransactionReportsByUser.fulfilled, (state, action) => {
        state.loadingTransactionReportsByUser = false;
        state.transactionReportsByUser = action.payload;
      })
      .addCase(fetchTransactionReportsByUser.rejected, (state, action) => {
        state.loadingTransactionReportsByUser = false;
        state.errorTransactionReportsByUser =
          action.payload?.error || "Failed to fetch transaction reports";
      })

      // Handle deleteTransactionReport
      .addCase(deleteTransactionReport.fulfilled, (state, action) => {
        state.transactionReportsByUser = state.transactionReportsByUser.filter(
          (report) => report.id !== action.payload
        );
      });
  },
});

export default transactionReportsByUserSlice.reducer;
