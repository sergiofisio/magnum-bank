import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import AccountCard from "./AccountCard";
import Button from "./Button";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import type { RootState } from "../store";

const AccountList = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const [areAllBalancesVisible, setAreAllBalancesVisible] = useState(false);
  const { selectedAccountId } = useSelector((state: RootState) => state.ui);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t("home.title")}</h1>
        <Button
          variant="secondary"
          onClick={() => setAreAllBalancesVisible(!areAllBalancesVisible)}
          className="flex items-center space-x-2"
        >
          {areAllBalancesVisible ? <FaEyeSlash /> : <FaEye />}
          <span>
            {areAllBalancesVisible
              ? t("home.hideAllBalances")
              : t("home.showAllBalances")}
          </span>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {user?.accounts?.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            isGloballyVisible={areAllBalancesVisible}
            isSelected={selectedAccountId === account.id}
          />
        ))}
      </div>
    </div>
  );
};

export default AccountList;
