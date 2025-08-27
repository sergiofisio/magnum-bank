import { useMemo } from "react";
import { useSelector } from "react-redux";
import { format } from "date-fns";
import type { RootState } from "../store";
import type { Transaction, TransactionType } from "../interface/types";

export interface DailyGroup {
  date: string;
  transactionsByType: Record<TransactionType, Transaction[]>;
  startingBalance: number;
  endingBalance: number;
}

export const useGroupedTransactions = () => {
  const { transactions } = useSelector(
    (state: RootState) => state.transactions
  );

  const groupedTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const groupedByDate = transactions.reduce((acc, tx) => {
      const date = format(new Date(tx.date), "yyyy-MM-dd");
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(tx);
      return acc;
    }, {} as Record<string, Transaction[]>);

    const dailyGroups = Object.keys(groupedByDate).map((date) => {
      const dailyTxs = groupedByDate[date];

      dailyTxs.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      const endingBalance = parseFloat(dailyTxs[0].balanceAfterTransaction);
      const oldestTxOfDay = dailyTxs[dailyTxs.length - 1];
      const oldestTxValue = parseFloat(oldestTxOfDay.value);
      const balanceBeforeOldestTx =
        oldestTxOfDay.type === "DEPOSIT"
          ? parseFloat(oldestTxOfDay.balanceAfterTransaction) - oldestTxValue
          : parseFloat(oldestTxOfDay.balanceAfterTransaction) + oldestTxValue;

      const transactionsByType = dailyTxs.reduce((acc, tx) => {
        if (!acc[tx.type]) {
          acc[tx.type] = [];
        }
        acc[tx.type].push(tx);
        return acc;
      }, {} as Record<TransactionType, Transaction[]>);

      return {
        date,
        transactionsByType,
        startingBalance: balanceBeforeOldestTx,
        endingBalance,
      };
    });

    return dailyGroups.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [transactions]);

  return groupedTransactions;
};
