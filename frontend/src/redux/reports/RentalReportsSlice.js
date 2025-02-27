import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Define the base URL for rental reports API endpoints
const BASE_URL = "http://localhost:3001/api/rental-reports";

export const submitRentalReport = createAsyncThunk(
  "reports/submitRental",
  async ({ transactionId, reason, files }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("rental_transaction_id", transactionId);
      formData.append("reason", reason);
      files.forEach((file) => formData.append("evidence", file));

      const response = await axios.post(`${BASE_URL}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("Error in submitRentalReport thunk:");
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      } else if (error.request) {
        console.error("No response received. Error request:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
      console.error("Error config:", error.config);
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    }
  }
);

export const submitReportResponse = createAsyncThunk(
  "reports/submitResponse",
  async ({ reportId, responseText, files }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("response", responseText);
      files.forEach((file) => formData.append("evidence", file));

      const response = await axios.post(
        `${BASE_URL}/${reportId}/response`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return response.data;
    } catch (error) {
      console.error("Error in submitReportResponse thunk:");
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      } else if (error.request) {
        console.error("No response received. Error request:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
      console.error("Error config:", error.config);
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    }
  }
);

// Modified thunk: now accepts an object with reportId and token
export const fetchReportDetails = createAsyncThunk(
  "reports/fetchDetails",
  async ({ reportId, token }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/${reportId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error in fetchReportDetails thunk:");
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      } else if (error.request) {
        console.error("No response received. Error request:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
      console.error("Error config:", error.config);
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    }
  }
);

const rentalReportsSlice = createSlice({
  name: "rentalReports",
  initialState: {
    reportDetails: null, // for storing fetched report details
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(submitRentalReport.pending, (state) => {
        state.status = "loading";
      })
      .addCase(submitRentalReport.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(submitRentalReport.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(submitReportResponse.pending, (state) => {
        state.status = "loading";
      })
      .addCase(submitReportResponse.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(submitReportResponse.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchReportDetails.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchReportDetails.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.reportDetails = action.payload;
      })
      .addCase(fetchReportDetails.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default rentalReportsSlice.reducer;
