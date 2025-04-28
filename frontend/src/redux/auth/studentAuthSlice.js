import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseApi } from "../../utils/consonants";
import axios from "axios";

const initialState = {
  studentUser: JSON.parse(localStorage.getItem("studentUser")) || null,
  loading: false,
  error: null,
  passwordResetStatus: null,
  passwordResetError: null,
};

export const googleLogin = createAsyncThunk(
  "studentAuth/googleLogin",
  async (token, { rejectWithValue }) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`${baseApi}/user/google-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Google Login Error Response:", errorData);
        throw new Error(errorData.message || "Failed to log in with Google.");
      }

      const data = await response.json();

      if (data.token && data.role && data.userId) {
        localStorage.setItem("studentUser", JSON.stringify(data));

        return data;
      } else {
        throw new Error("Invalid response data from server.");
      }
    } catch (error) {
      if (error.name === "AbortError") {
        return rejectWithValue("Request timed out. Please try again.");
      }
      return rejectWithValue(error.message || "Unexpected error occurred.");
    } finally {
      clearTimeout(timeoutId);
    }
  }
);

export const manualLogin = createAsyncThunk(
  "studentAuth/manualLogin",
  async (loginData, { rejectWithValue }) => {
    const { email, password } = loginData;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${baseApi}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          return rejectWithValue("Invalid email or password.");
        } else if (response.status === 500) {
          return rejectWithValue("Server error. Please try again later.");
        } else {
          return rejectWithValue(
            errorData.message || "Login failed. Please try again."
          );
        }
      }

      const data = await response.json();
      if (data.token && data.role && data.userId) {
        localStorage.setItem("studentUser", JSON.stringify(data));

        return data;
      } else {
        return rejectWithValue("Invalid response data. Please try again.");
      }
    } catch (error) {
      if (error.name === "AbortError") {
        return rejectWithValue("Request timed out. Please try again.");
      }
      return rejectWithValue(error.message || "Unexpected error occurred.");
    } finally {
      clearTimeout(timeoutId);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "studentAuth/forgotPassword",
  async (email, { rejectWithValue }) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${baseApi}/user/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(
          errorData.message || "Failed to send reset email. Please try again."
        );
      }

      const data = await response.json();
      return data.message || "Password reset link sent to your email";
    } catch (error) {
      if (error.name === "AbortError") {
        return rejectWithValue("Request timed out. Please try again.");
      }
      return rejectWithValue(error.message || "Unexpected error occurred.");
    } finally {
      clearTimeout(timeoutId);
    }
  }
);

export const validateResetToken = createAsyncThunk(
  "auth/validateResetToken",
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${baseApi}/user/validate-reset-token`,
        { token }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const resetPassword = createAsyncThunk(
  "studentAuth/resetPassword",
  async ({ token, newPassword }, { rejectWithValue }) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${baseApi}/user/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword }),
        // signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(
          errorData.message || "Password reset failed. Please try again."
        );
      }

      const data = await response.json();
      return data.message || "Password reset successful";
    } catch (error) {
      if (error.name === "AbortError") {
        return rejectWithValue("Request timed out. Please try again.");
      }
      return rejectWithValue(error.message || "Unexpected error occurred.");
    } finally {
      clearTimeout(timeoutId);
    }
  }
);

const studentAuthSlice = createSlice({
  name: "studentAuth",
  initialState,
  reducers: {
    logoutStudent: (state) => {
      state.studentUser = null;
      localStorage.removeItem("studentUser");
      state.error = null;
    },

    saveUserData: (state, action) => {
      const { token, role, userId } = action.payload;
      const newUser = { token, role, userId };
      state.studentUser = newUser;
      localStorage.setItem("studentUser", JSON.stringify(newUser));
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearPasswordResetStatus: (state) => {
      state.passwordResetStatus = null;
      state.passwordResetError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(manualLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(manualLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.studentUser = action.payload;
        state.error = null;
      })
      .addCase(manualLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.studentUser = action.payload;
        state.error = null;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.passwordResetStatus = null;
        state.passwordResetError = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.passwordResetStatus = "email-sent";
        state.passwordResetError = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.passwordResetStatus = null;
        state.passwordResetError = action.payload;
      })

      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.passwordResetStatus = null;
        state.passwordResetError = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.passwordResetStatus = "reset-success";
        state.passwordResetError = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.passwordResetStatus = null;
        state.passwordResetError = action.payload;
      });
  },
});

export const selectStudentUser = (state) => state.studentAuth.studentUser;
export const studentAuthLoading = (state) => state.studentAuth.loading;
export const studentAuthError = (state) => state.studentAuth.error;
export const selectPasswordResetStatus = (state) =>
  state.studentAuth.passwordResetStatus;
export const selectPasswordResetError = (state) =>
  state.studentAuth.passwordResetError;

export const {
  logoutStudent,
  saveUserData,
  setLoading,
  setError,
  clearPasswordResetStatus,
} = studentAuthSlice.actions;

export default studentAuthSlice.reducer;
