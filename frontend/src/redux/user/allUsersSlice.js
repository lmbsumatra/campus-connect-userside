import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { updateUserActionById } from "./otherUserSlice";
import { useDispatch } from "react-redux";
import { baseApi } from "../../utils/consonants";

const BASE_URL = `${baseApi}/user/get`;

const initialState = {
  allUsers: [],
  loadingAllUsers: false,
  errorAllUsers: null,
  loadingFollow: false,
  successFollow: false,
  errorFollow: null,
};

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

export const updateUserAction = createAsyncThunk(
  "users/updateUserActions",
  async ({ loggedInUserId, otherUserId }, { getState }) => {
    const dispatch = useDispatch();
    if (!loggedInUserId) {
      console.error("User must be logged in to follow");
      return;
    }
    try {
      const response = await fetch(`${baseApi}/api/follow/follow-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loggedInUserId,
          otherUserId,
        }),
      });

      if (!response.ok) {
        console.error("Server error:", response.status, response.statusText);
        return;
      }

      const data = await response.json();
      dispatch(
        updateUserActionById({
          otherUserId: otherUserId,
          action: data.action,
          data,
        })
      );
      return { userId: otherUserId, action: data.action };
    } catch (error) {
      console.error("Error during follow request:", error);
    }
  }
);

const allUsersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    resetFollowState: (state) => {
      state.successFollow = false;
      state.errorFollow = null;
    },
  },
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

      .addCase(updateUserAction.pending, (state) => {
        state.loadingFollow = true;
        state.successFollow = false;
        state.errorFollow = null;
      })
      .addCase(updateUserAction.fulfilled, (state, action) => {
        state.loadingFollow = false;
        state.successFollow = true;

        const { userId, action: newAction } = action.payload;
        state.allUsers = state.allUsers.map((user) =>
          user.id === Number(userId) ? { ...user, action: newAction } : user
        );
      })
      .addCase(updateUserAction.rejected, (state, action) => {
        state.loadingFollow = false;
        state.successFollow = false;
        state.errorFollow = action.payload || "Something went wrong!";
      });
  },
});

export const { resetFollowState } = allUsersSlice.actions;

export default allUsersSlice.reducer;
