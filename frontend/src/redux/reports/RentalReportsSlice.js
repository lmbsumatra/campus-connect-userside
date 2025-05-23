import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { baseApi } from "../../utils/consonants";

const BASE_URL = `${baseApi}/api/transaction-reports`;

export const submitTransactionReport = createAsyncThunk(
  "reports/submitTransaction",
  async (
    { transactionId, transactionType, reason, files, token },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      formData.append("transaction_id", transactionId);
      formData.append("transaction_type", transactionType);
      formData.append("reason", reason);
      files.forEach((file) => formData.append("evidence", file));

      const fullUrl = `${BASE_URL}`;

      const response = await axios.post(fullUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.status, error.response?.data);
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    }
  }
);

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

export const fetchReportDetails = createAsyncThunk(
  "reports/fetchDetails",
  async ({ reportId, token }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/student/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching report details for student (Report ID: ${reportId}):`,
        error
      );
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    }
  }
);

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

const transactionReportsSlice = createSlice({
  name: "transactionReports",
  initialState: {
    reportDetails: null,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(submitTransactionReport.pending, (state) => {
        state.status = "loading";
      })
      .addCase(submitTransactionReport.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(submitTransactionReport.rejected, (state, action) => {
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

export default transactionReportsSlice.reducer;
