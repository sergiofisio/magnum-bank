import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { AppDispatch, RootState } from "../store";
import { fetchTransactions } from "../store/slices/transactionSlice";
import { useGroupedTransactions } from "../hooks/useGroupedTransactions";
import DailyTransactionGroup from "./DailyTransactionGroup";

const StatementList = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const { selectedAccountId } = useSelector((state: RootState) => state.ui);
  const { isLoading } = useSelector((state: RootState) => state.transactions);
  const groupedTransactions = useGroupedTransactions();

  useEffect(() => {
    if (selectedAccountId) {
      dispatch(fetchTransactions({ accountId: selectedAccountId }));
    }
  }, [selectedAccountId, dispatch]);

  if (!selectedAccountId) {
    return (
      <p className="text-text-secondary text-center mt-10">
        {t("sidebar.selectAccountPrompt")}
      </p>
    );
  }

  return (
    <>
      <h2 className="text-xl font-bold font-display mb-4">
        {t("sidebar.statement")}
      </h2>
      {isLoading && (
        <p className="text-text-secondary">{t("history.loading")}</p>
      )}
      {!isLoading && groupedTransactions.length === 0 && (
        <p className="text-text-secondary">{t("home.noTransactionsFound")}</p>
      )}
      {!isLoading &&
        groupedTransactions.map((group) => (
          <DailyTransactionGroup key={group.date} group={group} />
        ))}
    </>
  );
};

export default StatementList;
