import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "..";

const selectAuth = (state: RootState) => state.auth;
const selectUi = (state: RootState) => state.ui;

export const selectSelectedAccount = createSelector(
  [selectAuth, selectUi],
  (auth, ui) => {
    if (!auth.user || !ui.selectedAccountId) return null;
    return auth.user.accounts.find((acc) => acc.id === ui.selectedAccountId);
  }
);
