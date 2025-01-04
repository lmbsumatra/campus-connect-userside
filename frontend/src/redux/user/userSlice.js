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
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProfileImage = createAsyncThunk(
  "user/updateProfileImage",
  async ({ userId, formData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/${userId}/upload-profile-image`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
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
    loadingUpdateImage: false,
    errorUpdateImage: null,
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
      })
      .addCase(updateProfileImage.pending, (state) => {
        state.loadingUpdateImage = true;
        state.errorUpdateImage = null;
      })
      .addCase(updateProfileImage.fulfilled, (state, action) => {
        state.loadingUpdateImage = false;
        if (state.user?.user) {
          state.user.user.profileImage = action.payload.imageUrl;
        }
        state.errorUpdateImage = null;
      })
      .addCase(updateProfileImage.rejected, (state, action) => {
        state.loadingUpdateImage = false;
        state.errorUpdateImage = action.payload;
      });
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;