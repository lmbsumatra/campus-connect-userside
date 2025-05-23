import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { baseApi } from "../../utils/consonants";
import { useDispatch } from "react-redux";
import { logoutStudent } from "../auth/studentAuthSlice";

const BASE_URL = `${baseApi}/user/info`;

export const fetchUser = createAsyncThunk(
  "user/fetchUser",
  async (id, { getState, rejectWithValue, dispatch }) => {
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
        dispatch(logoutStudent());
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
      const response = await fetch(
        `${BASE_URL}/${userId}/upload-profile-image`,
        {
          method: "POST",
          body: formData,
        }
      );

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

export const updateUserAction = createAsyncThunk(
  "users/updateUserActions",
  async ({ loggedInUserId, otherUserId }, { getState }) => {
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
      return { userId: otherUserId, action: data.action };
    } catch (error) {
      console.error("Error during follow request:", error);
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
          state.user.student.profilePic = action.payload.imageUrl;
        }
        state.errorUpdateImage = null;
      })
      .addCase(updateProfileImage.rejected, (state, action) => {
        state.loadingUpdateImage = false;
        state.errorUpdateImage = action.payload;
      })
      .addCase(updateUserAction.fulfilled, (state, action) => {
        const { action: newAction } = action.payload;
        state.user.action = newAction;
      })

      .addCase(updateUserAction.rejected, (state, action) => {
        console.error(
          "Error while updating user action:",
          action.error.message
        );
      });
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
