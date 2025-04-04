import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthorized: false,
  },
  reducers: {
    authorize: (state) => {
      state.isAuthorized = true;
    },
    unauthorize: (state) => {
      state.isAuthorized = false;
    },
  },
});

export const { authorize, unauthorize } = authSlice.actions;

export default authSlice.reducer;

// import { createSlice } from '@reduxjs/toolkit'

// export const counterSlice = createSlice({
//   name: 'isauthorized',
//   initialState: {
//     value: false,
//   },
//   reducers: {
//     increment: (state) => {
//       state.value = true
//     },
//     decrement: (state) => {
//       state.value = false
//     },
//   },
// })

// // Action creators are generated for each case reducer function
// export const { increment, decrement} = counterSlice.actions

// export default counterSlice.reducer
