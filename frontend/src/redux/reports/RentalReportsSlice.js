import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Define the base URL for rental reports API endpoints
const BASE_URL = "http://localhost:3001/api/rental-reports";

// Thunk to submit a new rental report (unchanged)
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
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    }
  }
);

// Thunk to submit a report response (threaded response)
export const submitReportResponse = createAsyncThunk(
  "reports/submitResponse",
  async ({ reportId, responseText, files, token }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("response", responseText);
      files.forEach((file) => formData.append("evidence", file));

      const response = await axios.post(
        `${BASE_URL}/${reportId}/response`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    }
  }
);

// Thunk to fetch report details including responses
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
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    }
  }
);

// Thunk to mark report as resolved (reporter only)
export const resolveReport = createAsyncThunk(
  "reports/resolveReport",
  async ({ reportId, token }, { rejectWithValue }) => {
    try {
      await axios.put(
        `${BASE_URL}/${reportId}/resolve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return reportId;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    }
  }
);

// Thunk to escalate report to admin review (reporter only)
export const escalateReport = createAsyncThunk(
  "reports/escalateReport",
  async ({ reportId, token }, { rejectWithValue }) => {
    try {
      await axios.put(
        `${BASE_URL}/${reportId}/escalate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return reportId;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    }
  }
);

const rentalReportsSlice = createSlice({
  name: "rentalReports",
  initialState: {
    reportDetails: null, // for storing fetched report details (including responses)
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
      })
      .addCase(resolveReport.fulfilled, (state, action) => {
        if (state.reportDetails) {
          state.reportDetails.status = "resolved";
        }
      })
      .addCase(escalateReport.fulfilled, (state, action) => {
        if (state.reportDetails) {
          state.reportDetails.status = "escalated";
        }
      });
  },
});

export default rentalReportsSlice.reducer;
