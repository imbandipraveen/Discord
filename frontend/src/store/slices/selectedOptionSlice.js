import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: 0,
  option_name: '',
  status: false,
  text: '',
};

const selectedOptionSlice = createSlice({
  name: 'selected_option',
  initialState,
  reducers: {
    setSelectedOption: (state, action) => {
      return { ...state, ...action.payload };
    },
    clearSelectedOption: (state) => {
      return initialState;
    },
    setOptionStatus: (state, action) => {
      state.status = action.payload;
    },
    setOptionText: (state, action) => {
      state.text = action.payload;
    },
  },
});

export const {
  setSelectedOption,
  clearSelectedOption,
  setOptionStatus,
  setOptionText,
} = selectedOptionSlice.actions;

export default selectedOptionSlice.reducer; 