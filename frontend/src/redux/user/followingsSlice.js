import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseApi } from "../../utils/consonants";

const BASE_URL = `${baseApi}/api/follow`;

// Fetch both followings & followers
export const fetchFollowings = createAsyncThunk(
  "followings/fetchFollowings",
  async (token, { rejectWithValue }) => {
    if (!token) return rejectWithValue("User is not logged in.");

    try {
      const response = await fetch(`${BASE_URL}/followings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      return { followings: data.followings, followers: data.followers };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Generic Follow/Unfollow Action
export const updateFollowStatus = createAsyncThunk(
  "followings/updateFollowStatus",
  async (
    { loggedInUserId, otherUserId, actionType },
    { getState, rejectWithValue }
  ) => {
    const state = getState();
    const { studentUser } = state.studentAuth || {};

    if (!studentUser)
      return rejectWithValue("User must be logged in to perform this action");

    try {
      const response = await fetch(`${BASE_URL}/follow-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${studentUser.token}`,
        },
        body: JSON.stringify({ loggedInUserId, otherUserId }),
      });

      if (!response.ok)
        return rejectWithValue(
          `Server error: ${response.status} ${response.statusText}`
        );
      const data = await response.json();
      return { userId: otherUserId, action: data.action };
    } catch (error) {
      return rejectWithValue(`Error during request: ${error.message}`);
    }
  }
);

const followingsSlice = createSlice({
  name: "followings",
  initialState: {
    followings: [],
    followers: [],
    loading: false,
    error: null,
    loadingAction: false,
    successAction: false,
    errorAction: null,
  },
  reducers: {
    clearFollowings: (state) => {
      state.followings = [];
      state.followers = [];
      state.error = null;
      state.successAction = false;
      state.errorAction = null;
    },
    resetActionState: (state) => {
      state.successAction = false;
      state.errorAction = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFollowings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFollowings.fulfilled, (state, action) => {
        state.loading = false;
        state.followings = action.payload.followings;
        state.followers = action.payload.followers;
        state.error = null;
      })
      .addCase(fetchFollowings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.followings = [];
        state.followers = [];
      })
      .addCase(updateFollowStatus.pending, (state) => {
        state.loadingAction = true;
        state.successAction = false;
        state.errorAction = null;
      })
      .addCase(updateFollowStatus.fulfilled, (state, action) => {
        state.loadingAction = false;
        state.successAction = true;

        const { userId, action: newAction } = action.payload;

        if (newAction === "follow") {
          state.followings.push({ id: userId });
        } else if (newAction === "unfollow") {
          state.followings = state.followings.filter(
            (user) => user.id !== userId
          );
        }
      })
      .addCase(updateFollowStatus.rejected, (state, action) => {
        state.loadingAction = false;
        state.successAction = false;
        state.errorAction = action.payload || "Something went wrong!";
      });
  },
});

export const { clearFollowings, resetActionState } = followingsSlice.actions;
export default followingsSlice.reducer;
