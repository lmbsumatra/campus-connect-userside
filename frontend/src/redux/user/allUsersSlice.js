import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "http://localhost:3001/user/get";

const initialState = {
  allUsers: [],
  loadingAllUsers: false,
  errorAllUsers: null,
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
    // console.log(response.data); // bat kaya minsan, need muna i-print yung result sa console then saka sya maggign ok?
    return response.json();
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
      });
  },
});

export default allUsersSlice.reducer;
