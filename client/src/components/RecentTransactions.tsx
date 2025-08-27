import React from "react";
import { useTranslation } from "react-i18next";
import type { Transaction } from "../interface/types";
import TransactionItem from "./TransactionItem";

interface RecentTransactionsProps {
  transactions: Transaction[];
  isLoading: boolean;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  isLoading,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-surface p-6 rounded-lg shadow-md flex flex-col h-10/12">
      <div className="flex-grow overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary-500 scrollbar-track-primary-100 !px-4">
        {isLoading && (
          <p className="text-text-secondary">{t("history.loading")}</p>
        )}
        {!isLoading && transactions.length === 0 && (
          <p className="text-text-secondary">{t("home.noTransactionsFound")}</p>
        )}
        {!isLoading && transactions.length > 0 && (
          <ul className="divide-y divide-border">
            {transactions.map((tx) => (
              <TransactionItem key={tx.id} tx={tx} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RecentTransactions;
