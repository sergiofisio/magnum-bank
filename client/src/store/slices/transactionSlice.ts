import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import api from "../../api";
import type { Transaction } from "../../interface/types";
import { toast } from "react-toastify";
import i18n from "../../i18n";
import { fetchUserProfile } from "./authSlice";

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}

export const createTransaction = createAsyncThunk(
  "transactions/createTransaction",
  async (transactionData: any, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post("/transactions", transactionData);
      toast.success(i18n.t("transaction.success"));
      dispatch(fetchTransactions({ accountId: transactionData.accountId }));
      dispatch(fetchUserProfile());
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "error.transaction.generic";
      toast.error(i18n.t(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  "transactions/fetchTransactions",
  async (
    filters: { accountId?: string; period?: string } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get("/transactions", { params: filters });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const initialState: TransactionState = {
  transactions: [],
  isLoading: false,
  error: null,
};

const transactionSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchTransactions.fulfilled,
        (state, action: PayloadAction<Transaction[]>) => {
          state.isLoading = false;
          state.transactions = action.payload;
        }
      )
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default transactionSlice.reducer;
