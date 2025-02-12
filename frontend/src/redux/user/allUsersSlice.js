import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "http://localhost:3001/user/get";

const initialState = {
  allUsers: [],
  loadingAllUsers: false,
  errorAllUsers: null,
};

// Fetch all users
export const fetchAllUsers = createAsyncThunk(
  "users/allUsers",
  async (keyword = "", { getState }) => {
    const { studentUser } = getState().studentAuth;

    const url = keyword
      ? `${BASE_URL}?q=${encodeURIComponent(keyword)}`
      : BASE_URL;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${studentUser.token}`,
      },
    });
    const data = await response.json();
    return data;
  }
);

// Update follow/unfollow action
export const updateUserAction = createAsyncThunk(
  "users/updateUserActions",
  async ({ loggedInUserId, otherUserId }, { getState }) => {
    console.log({ loggedInUserId, otherUserId });
    if (!loggedInUserId) {
      console.error("User must be logged in to follow");
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:3001/api/follow/follow-user",
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
      console.log({ userId: otherUserId, action: data.action });
      return { userId: otherUserId, action: data.action };
    } catch (error) {
      console.error("Error during follow request:", error);
    }
  }
);

const allUsersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.loadingAllUsers = true;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loadingAllUsers = false;
        state.allUsers = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loadingAllUsers = false;
        state.errorAllUsers = action.error.message;
      })

      // Handle follow/unfollow update in Redux
      .addCase(updateUserAction.fulfilled, (state, action) => {
        const { userId, action: newAction } = action.payload;

        state.allUsers = state.allUsers.map((user) =>
          user.id === userId ? { ...user, action: newAction } : user
        );
      })

      .addCase(updateUserAction.rejected, (state, action) => {
        console.error(
          "Error while updating user action:",
          action.error.message
        );
      });
  },
});

export default allUsersSlice.reducer;
