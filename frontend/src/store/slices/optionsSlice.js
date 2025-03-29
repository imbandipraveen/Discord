import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: 0,
};

const optionsSlice = createSlice({
  name: 'options',
  initialState,
  reducers: {
    update_options: (state) => {
      state.value += 1;
    },
    reset_options: (state) => {
      state.value = 0;
    },
  },
});

export const { update_options, reset_options } = optionsSlice.actions;

export default optionsSlice.reducer; 