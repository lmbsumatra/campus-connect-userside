import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { useSelector } from "react-redux";

const initialState = {
  notifications: [],
  unreadCount: 0,
  status: "idle",
  error: null,
};

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (userId, { getState }) => {
    const token = getState().studentAuth.studentUser?.token;
    const response = await axios.get(
      `http://localhost:3001/api/notifications/student/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  }
);

export const markAllRead = createAsyncThunk(
  "notifications/markAllRead",
  async (userId) => {
    await axios.put(
      `http://localhost:3001/api/notifications/student/mark-all-read/${userId}`
    );
    return userId;
  }
);

export const markNotificationAsRead = createAsyncThunk(
  "notifications/markAsRead",
  async (notifId, { rejectWithValue }) => {
    try {
      // Ensure notifId is a string or number
      if (typeof notifId !== "string" && typeof notifId !== "number") {
        throw new Error("Invalid notification ID");
      }

      const response = await axios.patch(
        `http://localhost:3001/api/notifications/student/${notifId}/read`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    notifications: [],
    unreadCount: 0,
    status: "idle",
    error: null,
  },
  reducers: {
    addNotification: (state, action) => {
      const exists = state.notifications.some(
        (n) => n.id === action.payload.id
      );
      if (!exists) {
        state.notifications.unshift(action.payload);
        state.unreadCount += 1;
      }
    },
    markAsRead: (state, action) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification && !notification.is_read) {
        notification.is_read = true;
        state.unreadCount -= 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.is_read).length;
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((n) => ({
          ...n,
          is_read: true,
        }));
        state.unreadCount = 0;
      })
      .addCase(fetchNotifications.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(markNotificationAsRead.pending, (state) => {
        state.status = "loading";
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(
          (notif) => notif.id === action.payload.id
        );
        if (index !== -1) {
          state.notifications[index].is_read = true;
          state.unreadCount -= 1;
        }
        state.status = "succeeded";
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { addNotification, markAsRead } = notificationSlice.actions;
export const selectNotifications = (state) => state.notifications.notifications;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export default notificationSlice.reducer;
