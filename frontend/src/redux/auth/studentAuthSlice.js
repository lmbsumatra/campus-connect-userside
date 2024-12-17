import { createSlice } from "@reduxjs/toolkit";

// Initial state
const initialState = {
  studentUser: JSON.parse(localStorage.getItem("studentUser")) || null,
};

// Authentication Slice for Student User
const studentAuthSlice = createSlice({
  name: "studentAuth",
  initialState,
  reducers: {
    loginStudent: (state, action) => {
      const { token, role, userId } = action.payload;
      const newUser = { token, role, userId };
      state.studentUser = newUser;
      localStorage.setItem("studentUser", JSON.stringify(newUser));
    },
    logoutStudent: (state) => {
      state.studentUser = null;
      localStorage.removeItem("studentUser");
    },
  },
});

// Selectors
export const selectStudentUser = (state) => state.studentAuth.studentUser;

// Export actions
export const { loginStudent, logoutStudent } = studentAuthSlice.actions;

// Export reducer
export default studentAuthSlice.reducer;
