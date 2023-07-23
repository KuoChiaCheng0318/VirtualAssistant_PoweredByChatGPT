import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import speakingReducer from "./speakingSlice";

export default configureStore({
  reducer: {
    user: userReducer,
    speaking: speakingReducer,
  },
  middleware: getDefaultMiddleware({
    serializableCheck: false,
  }),
});