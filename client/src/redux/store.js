import { configureStore } from "@reduxjs/toolkit";
import options from "./optionsSlice";
import page from "./currentPage";
import user_creds from "./userCredsSlice";

export default configureStore({
  reducer: {
    selected_option: options,
    current_page: page,
    user_info: user_creds,
  },
});
