import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { fetchTransactions } from "../store/slices/transactionSlice";
import type { AppDispatch, RootState } from "../store";

import PeriodFilter from "../components/PeriodFilter";
import DailyTransactionGroup from "../components/DailyTransactionGroup";
import { useGroupedTransactions } from "../hooks/useGroupedTransactions";

const TransactionHistoryPage = () => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState("7d");
  const dispatch = useDispatch<AppDispatch>();

  // 👇 1. Obtenha a conta selecionada do estado da UI
  const { selectedAccountId } = useSelector((state: RootState) => state.ui);
  const { isLoading } = useSelector((state: RootState) => state.transactions);
  const groupedTransactions = useGroupedTransactions();

  useEffect(() => {
    if (selectedAccountId) {
      dispatch(fetchTransactions({ period, accountId: selectedAccountId }));
    }
  }, [period, selectedAccountId, dispatch]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{t("history.title")}</h1>
          <PeriodFilter period={period} onPeriodChange={setPeriod} />
        </div>
      </div>

      <div className="flex-grow overflow-y-auto pr-4">
        {isLoading && <p>{t("history.loading")}</p>}

        {!selectedAccountId && !isLoading && (
          <p className="text-text-secondary text-center mt-10">
            {t("sidebar.selectAccountPrompt")}
          </p>
        )}

        {selectedAccountId &&
          !isLoading &&
          groupedTransactions.length === 0 && (
            <p className="text-text-secondary">
              {t("home.noTransactionsFound")}
            </p>
          )}

        {selectedAccountId &&
          !isLoading &&
          groupedTransactions.map((group) => (
            <DailyTransactionGroup key={group.date} group={group} />
          ))}
      </div>
    </div>
  );
};

export default TransactionHistoryPage;
