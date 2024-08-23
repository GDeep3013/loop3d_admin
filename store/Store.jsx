import { configureStore } from "@reduxjs/toolkit";
import UserSlice from "./slices/UserSlice";
import dashboardReducer from "./slices/DashboardSlice"; 

export const store = configureStore({
  reducer: {
    auth: UserSlice,
    dashboard: dashboardReducer,
  },
});



