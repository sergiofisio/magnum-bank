import React from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { selectAccount } from "../store/slices/uiSlice";

const AccountSelector = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { selectedAccountId } = useSelector((state: RootState) => state.ui);

  const handleAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(selectAccount(e.target.value));
  };

  return (
    <select
      value={selectedAccountId || ""}
      onChange={handleAccountChange}
      className="w-full p-2 border rounded-md mb-4 bg-surface"
    >
      <option value="" disabled>
        Selecione uma conta
      </option>
      {user?.accounts?.map((account) => (
        <option key={account.id} value={account.id}>
          Ag. {account.agency} / C.C. {account.number}-{account.digit}
        </option>
      ))}
    </select>
  );
};

export default AccountSelector;
