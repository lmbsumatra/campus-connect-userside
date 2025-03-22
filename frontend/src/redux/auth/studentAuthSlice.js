import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Initial state
const initialState = {
  studentUser: JSON.parse(localStorage.getItem("studentUser")) || null,
  loading: false,
  error: null,
};

export const googleLogin = createAsyncThunk(
  "studentAuth/googleLogin",
  async (token, { rejectWithValue }) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased timeout

    try {
      // console.log("Sending Google Token:", token); // Debug log

      const response = await fetch(`http://localhost:3001/user/google-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Google Login Error Response:", errorData); // Debug log
        throw new Error(errorData.message || "Failed to log in with Google.");
      }

      const data = await response.json();
      // console.log("Google Login Response Data:", data); // Debug log

      if (data.token && data.role && data.userId) {
        localStorage.setItem("studentUser", JSON.stringify(data));
        console.log(data);
        return data; // Return successful login data
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

// Async thunk for manual login
export const manualLogin = createAsyncThunk(
  "studentAuth/manualLogin",
  async (loginData, { rejectWithValue }) => {
    const { email, password } = loginData;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout

    try {
      const response = await fetch(`http://localhost:3001/user/login`, {
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
        
        return data; // Return successful login data
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

// Authentication Slice for Student User
const studentAuthSlice = createSlice({
  name: "studentAuth",
  initialState,
  reducers: {
    logoutStudent: (state) => {
      state.studentUser = null;
      localStorage.removeItem("studentUser");
      state.error = null; // Clear errors on logout
    },

    saveUserData: (state, action) => {
      const { token, role, userId } = action.payload;
      const newUser = { token, role, userId };
      state.studentUser = newUser;
      localStorage.setItem("studentUser", JSON.stringify(newUser)); // Store in localStorage
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(manualLogin.pending, (state) => {
        state.loading = true;
        state.error = null; // Clear previous errors
      })
      .addCase(manualLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.studentUser = action.payload;
        state.error = null; // Clear errors on success
      })
      .addCase(manualLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Set error from rejected action
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
      });
  },
});

// Selectors
export const selectStudentUser = (state) => state.studentAuth.studentUser;
export const studentAuthLoading = (state) => state.studentAuth.loading;
export const studentAuthError = (state) => state.studentAuth.error;

// Export actions
export const { logoutStudent, saveUserData, setLoading, setError } =
  studentAuthSlice.actions;

// Export reducer
export default studentAuthSlice.reducer;
