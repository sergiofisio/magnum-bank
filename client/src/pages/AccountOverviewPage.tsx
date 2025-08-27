import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import type { AppDispatch, RootState } from "../store";
import { fetchTransactions } from "../store/slices/transactionSlice";

import RecentTransactions from "../components/RecentTransactions";
import { selectSelectedAccount } from "../store/slices/selectors";

const AccountOverviewPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const selectedAccount = useSelector(selectSelectedAccount);
  const { transactions, isLoading } = useSelector(
    (state: RootState) => state.transactions
  );

  useEffect(() => {
    if (selectedAccount) {
      dispatch(
        fetchTransactions({ accountId: selectedAccount.id, period: "7d" })
      );
    }
  }, [dispatch, selectedAccount]);

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">{t("home.overview")}</h1>
      <RecentTransactions
        transactions={recentTransactions}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AccountOverviewPage;
