import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  filterValue: [], // Define your initial state here
};

export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState, // Use the defined initialState
  reducers: {
    setFilterValue: (state, action) => {
      state.filterValue = action.payload;
    },
  },
});

export const { setFilterValue } = dashboardSlice.actions;

export const selectFilterValue = (state) => state.dashboard.filterValue;

export default dashboardSlice.reducer;
