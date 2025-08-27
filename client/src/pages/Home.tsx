import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { fetchTransactions } from "../store/slices/transactionSlice";

import AccountList from "../components/AccountList";
import BalanceCard from "../components/BalanceCard";
import RecentTransactions from "../components/RecentTransactions";
import { selectSelectedAccount } from "../store/slices/selectors";

const HomePage = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Pega os dados necessários do Redux
  const { selectedAccountId } = useSelector((state: RootState) => state.ui);
  const selectedAccount = useSelector(selectSelectedAccount);
  const { transactions, isLoading } = useSelector(
    (state: RootState) => state.transactions
  );

  useEffect(() => {
    if (selectedAccountId) {
      dispatch(
        fetchTransactions({ accountId: selectedAccountId, period: "30d" })
      );
    }
  }, [dispatch, selectedAccountId]);

  const balance = parseFloat(selectedAccount?.balance || "0");

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="container mx-auto p-6 h-full">
      {selectedAccountId && selectedAccount ? (
        <div className="space-y-8">
          <BalanceCard balance={balance} />
          <RecentTransactions
            transactions={recentTransactions}
            isLoading={isLoading}
          />
        </div>
      ) : (
        <AccountList />
      )}
    </div>
  );
};

export default HomePage;
