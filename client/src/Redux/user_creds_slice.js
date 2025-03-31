import { createSlice } from "@reduxjs/toolkit";
import defaultProfilePic from "../images/profile_pic.jpg";

export const user_creds = createSlice({
  name: "user_info",
  initialState: {
    username: "",
    tag: "",
    profile_pic: defaultProfilePic,
    id: 0,
  },
  reducers: {
    change_username: (state, action) => {
      state.username = action.payload;
    },
    change_tag: (state, action) => {
      state.tag = action.payload;
    },
    option_profile_pic: (state, action) => {
      state.profile_pic = action.payload || defaultProfilePic;
    },
    option_user_id: (state, action) => {
      state.id = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  change_username,
  change_tag,
  option_profile_pic,
  option_user_id,
} = user_creds.actions;

export default user_creds.reducer;
