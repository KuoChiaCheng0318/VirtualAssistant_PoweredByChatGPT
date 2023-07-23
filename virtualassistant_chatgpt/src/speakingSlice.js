import { createSlice } from "@reduxjs/toolkit";

const speakingSlice = createSlice({
  name: "speaking",
  initialState: false,
  reducers: {
    setSpeaking: (state, action) => {
      return action.payload;
    },
  },
});

export const { setSpeaking } = speakingSlice.actions;
export default speakingSlice.reducer;