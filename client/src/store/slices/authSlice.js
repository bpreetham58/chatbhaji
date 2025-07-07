import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";

export const getUser = createAsyncThunk("user/me", async (_, thunkAPI) => {
  try {
    const res = await axiosInstance.get("user/me");
    return res.data.user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return thunkAPI.rejectWithValue(error.response.data);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: false,
    authUser: null,
    isSigningIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    isLoggingIn: false,
    onlineUsers: [],
  },
  reducers: {
    setOnlineUsers(state, action) {
      state.onlineUsers = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.authUser = action.payload;
        state.isCheckingAuth = false; // ✅ fixed
      })
      .addCase(getUser.rejected, (state, action) => {
        state.authUser = null;
        state.isCheckingAuth = false;
      });
  },
});

export const { setOnlineUsers } = authSlice.actions;
export default authSlice.reducer;
