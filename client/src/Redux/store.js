import { configureStore } from "@reduxjs/toolkit";
import options from "./options_slice";
import page from "./current_page";
import user_creds from "./user_creds_slice";

export default configureStore({
  reducer: {
    selected_option: options,
    current_page: page,
    user_info: user_creds,
  },
});
