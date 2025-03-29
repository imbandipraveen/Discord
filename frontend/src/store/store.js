import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import currentPageReducer from './slices/currentPageSlice';
import optionsReducer from './slices/optionsSlice';
import selectedOptionReducer from './slices/selectedOptionSlice';

export const store = configureStore({
  reducer: {
    user_info: userReducer,
    current_page: currentPageReducer,
    options: optionsReducer,
    selected_option: selectedOptionReducer,
  },
}); 