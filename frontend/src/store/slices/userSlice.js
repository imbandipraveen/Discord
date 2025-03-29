import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  id: 0,
  username: '',
  tag: '',
  profile_pic: '',
  email: '',
  dob: '',
  servers: [],
  friends: [],
  incoming_reqs: [],
  outgoing_reqs: [],
};

const userSlice = createSlice({
  name: 'user_info',
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
      return { ...state, ...action.payload };
    },
    clearUserInfo: (state) => {
      return initialState;
    },
    updateServers: (state, action) => {
      state.servers = action.payload;
    },
    updateFriends: (state, action) => {
      state.friends = action.payload;
    },
    updateIncomingReqs: (state, action) => {
      state.incoming_reqs = action.payload;
    },
    updateOutgoingReqs: (state, action) => {
      state.outgoing_reqs = action.payload;
    },
  },
});

export const {
  setUserInfo,
  clearUserInfo,
  updateServers,
  updateFriends,
  updateIncomingReqs,
  updateOutgoingReqs,
} = userSlice.actions;

export default userSlice.reducer; 