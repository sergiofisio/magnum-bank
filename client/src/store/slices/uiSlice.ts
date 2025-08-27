import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  selectedAccountId: string | null;
}

const initialState: UiState = {
  selectedAccountId: localStorage.getItem("selectedAccountId") || null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    selectAccount: (state, action: PayloadAction<string | null>) => {
      const accountId = action.payload;
      state.selectedAccountId = accountId;

      if (accountId) {
        localStorage.setItem("selectedAccountId", accountId);
      } else {
        localStorage.removeItem("selectedAccountId");
      }
    },
  },
});

export const { selectAccount } = uiSlice.actions;
export default uiSlice.reducer;
