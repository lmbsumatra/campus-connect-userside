import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = "http://localhost:3001/user/info";

export const fetchUser = createAsyncThunk(
  "user/fetchUser",
  async (id, { rejectWithValue }) => {
    
    try {
      const response = await fetch(`${BASE_URL}/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data)
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: {},
    loadingFetchUser: false,
    errorFetchUser: null,
  },
  reducers: {
    clearUser: (state) => {
      state.user = null;
      state.errorFetchUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loadingFetchUser = true;
        state.errorFetchUser = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loadingFetchUser = false;
        state.user = action.payload;
        state.errorFetchUser = null;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loadingFetchUser = false;
        state.errorFetchUser = action.payload;
        state.user = null;
      });
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
