import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  userType: null,
  isTokenValid: false, // New state to track token validity
};

export const UserSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    createUser: (state, action) => {
      state.user = action.payload.user;
    },
    saveToken: (state, action) => {
      state.isAuthenticated = true;
      state.userType = action.payload.userType;
    },
    forgetpassword: (state, action) => {
      // Logic for password forgetting
    },
    setTokenValidity: (state, action) => {
      state.isTokenValid = action.payload.isTokenValid; 
    },
    userType: (state, action) => {
      state.userType = action.payload.userType; 
    },
  },
});


export const { createUser, saveToken, forgetpassword, setTokenValidity, userType } = UserSlice.actions;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserType = (state) => state.auth.userType;
export const selectIsTokenValid = (state) => state.auth.isTokenValid;

export default UserSlice.reducer;