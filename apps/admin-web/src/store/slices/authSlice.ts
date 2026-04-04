import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { getProfile } from "../../api/auth";

interface StaffUser {
  id: string;
  name: string;
  role: string;
}

interface AuthState {
  user: StaffUser | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export const checkAuth = createAsyncThunk("auth/check", async () => {
  const data = await getProfile();
  return data.user;
});

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<StaffUser | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(checkAuth.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(checkAuth.fulfilled, (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
    });
    builder.addCase(checkAuth.rejected, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    });
  }
});

export const { setUser, setLoading, logout } = authSlice.actions;
export default authSlice.reducer;
