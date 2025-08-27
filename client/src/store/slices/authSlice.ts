import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import api from "../../api";
import type {
  AuthState,
  LoginResponse,
  User,
} from "../../interface/interfaces";
import i18n from "../../i18n";

export const login = createAsyncThunk<
  LoginResponse,
  { cpf: string; password: string },
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post("/user/login", credentials);
    console.log({ response });

    localStorage.setItem("token", response.data.token);
    toast.success(i18n.t("login.success"));

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(response.data);
      }, 1000);
    });
  } catch (error: any) {
    console.log({ error });

    const errorMessage = error.response?.data?.message || "error.auth.generic";
    toast.error(i18n.t(errorMessage));
    return rejectWithValue(errorMessage);
  }
});

export const fetchUserProfile = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>("auth/fetchUserProfile", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/user/profile");
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response.data.message);
  }
});

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  isLoading: false,
  error: null,
};

export const registerUser = createAsyncThunk(
  "auth/register",
  async (formData: any, { rejectWithValue }) => {
    try {
      const response = await api.post("/user/register", formData);
      toast.success(i18n.t("register.success"));
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "error.auth.generic";
      toast.error(i18n.t(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem("token");
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<LoginResponse>) => {
          state.isLoading = false;
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.token = action.payload.token;
        }
      )
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(
        fetchUserProfile.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.isLoading = false;
          state.isAuthenticated = true;
          state.user = action.payload;
        }
      )
      .addCase(fetchUserProfile.rejected, (state) => {
        state.isLoading = false;
        localStorage.removeItem("token");
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
