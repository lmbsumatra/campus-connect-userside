import { tablePaginationClasses } from "@mui/material";
import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const tagSlice = createSlice({
    name: "tags",
    initialState,
    reducers: {
      addTag: (state, action) => {
        const exists = state.some((tag) => tag === action.payload);
        if (!exists) {
          state.push(action.payload);
        }
      },
      removeTag: (state, action) => {
        return state.filter((tag) => tag !== action.payload);
      },
    },
  });
  
  export const { addTag, removeTag } = tagSlice.actions;
  export default tagSlice.reducer;
  