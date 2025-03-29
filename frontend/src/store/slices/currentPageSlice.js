import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  page_id: '',
  page_name: '',
  server_exists: null,
  server_role: '',
};

const currentPageSlice = createSlice({
  name: 'current_page',
  initialState,
  reducers: {
    setPageInfo: (state, action) => {
      return { ...state, ...action.payload };
    },
    clearPageInfo: (state) => {
      return initialState;
    },
    setServerExists: (state, action) => {
      state.server_exists = action.payload;
    },
    setServerRole: (state, action) => {
      state.server_role = action.payload;
    },
  },
});

export const {
  setPageInfo,
  clearPageInfo,
  setServerExists,
  setServerRole,
} = currentPageSlice.actions;

export default currentPageSlice.reducer; 