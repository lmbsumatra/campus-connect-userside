import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseApi } from "../../utils/consonants";

const BASE_URL = `${baseApi}/user/other-user/info`;

export const fetchOtherUser = createAsyncThunk(
  "otherUser/fetchOtherUser",
  async (id, { getState, rejectWithValue }) => {
    const state = getState(); 

    const { studentUser } = state.studentAuth || {}; 

    if (!studentUser) {
      return rejectWithValue("User is not logged in.");
    }

    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${studentUser.token}`,
        },
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

export const updateUserActionById = createAsyncThunk(
  "users/updateUserActions",
  async ({ loggedInUserId, otherUserId }, { getState }) => {
    if (!loggedInUserId) {
      console.error("User must be logged in to follow");
      return;
    }
    try {
      const response = await fetch(
        `${baseApi}/api/follow/follow-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            loggedInUserId,
            otherUserId,
          }),
        }
      );

      if (!response.ok) {
        console.error("Server error:", response.status, response.statusText);
        return;
      }
      const data = await response.json();
      return { userId: otherUserId, action: data.action };
    } catch (error) {
      console.error("Error during follow request:", error);
    }
  }
);

const otherUserSlice = createSlice({
  name: "otherUser",
  initialState: {
    user: {},
    loadingFetchUser: false,
    errorFetchUser: null,
    loadingFollow: false,
    successFollow: false,
    errorFollow: null,
  },
  reducers: {
    clearOtherUser: (state) => {
      state.user = null;
      state.errorFetchUser = null;
      state.successFollow = false;
      state.errorFollow = null;
    },

    resetFollowState: (state) => {
      state.successFollow = false;
      state.errorFollow = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOtherUser.pending, (state) => {
        state.loadingFetchUser = true;
        state.errorFetchUser = null;
      })
      .addCase(fetchOtherUser.fulfilled, (state, action) => {
        state.loadingFetchUser = false;
        state.user = action.payload;
        state.errorFetchUser = null;
      })
      .addCase(fetchOtherUser.rejected, (state, action) => {
        state.loadingFetchUser = false;
        state.errorFetchUser = action.payload;
        state.user = null;
      })

      .addCase(updateUserActionById.pending, (state) => {
        state.loadingFollow = true;
        state.successFollow = false;
        state.errorFollow = null;
      })
      .addCase(updateUserActionById.fulfilled, (state, action) => {
        state.loadingFollow = false;
        state.successFollow = true;
        const { userId, action: newAction } = action.payload;

        if (state.user?.id === userId) {
          state.user.action = newAction;
        }

        state.user.action = newAction;
      })

      .addCase(updateUserActionById.rejected, (state, action) => {
        state.loadingFollow = false;
        state.successFollow = false;
        state.errorFollow = action.payload || "Something went wrong!";
      });
  },
});

export const { clearOtherUser, resetFollowState } = otherUserSlice.actions;
export default otherUserSlice.reducer;
