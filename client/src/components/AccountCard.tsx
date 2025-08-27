import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import type { Account } from "../interface/types";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { selectAccount } from "../store/slices/uiSlice";

interface AccountCardProps {
  account: Account;
  isGloballyVisible: boolean;
  isSelected: boolean;
}

const AccountCard: React.FC<AccountCardProps> = ({
  account,
  isGloballyVisible,
  isSelected,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { t, i18n } = useTranslation();
  const [isBalanceVisible, setIsBalanceVisible] = useState(isGloballyVisible);

  useEffect(() => {
    setIsBalanceVisible(isGloballyVisible);
  }, [isGloballyVisible]);

  const formattedBalance = parseFloat(account.balance).toLocaleString(
    i18n.language,
    {
      style: "currency",
      currency: "BRL",
    }
  );

  const handleSelectAccount = () => {
    dispatch(selectAccount(account.id));
  };

  return (
    <div
      onClick={handleSelectAccount}
      className={`bg-surface p-4 rounded-lg shadow-md border-2 transition-all cursor-pointer ${
        isSelected
          ? "border-primary-500 scale-105"
          : "border-border hover:border-gray-400"
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-text-secondary">
          {t("home.agency")} {account.agency}
        </span>
        <span className="text-sm text-text-secondary">
          {t("home.account")} {account.number}-{account.digit}
        </span>
      </div>
      <div className="flex justify-between items-center space-x-4 mt-4">
        <div
          className="h-8 flex-grow bg-gray-200 rounded animate-pulse"
          style={{ display: isBalanceVisible ? "none" : "block" }}
        />
        <p
          className="text-2xl font-bold text-text-primary"
          style={{ display: isBalanceVisible ? "block" : "none" }}
        >
          {formattedBalance}
        </p>
        <button
          onClick={() => setIsBalanceVisible(!isBalanceVisible)}
          className="text-text-secondary hover:text-primary-500 cursor-pointer"
        >
          {isBalanceVisible ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
        </button>
      </div>
    </div>
  );
};

export default AccountCard;
