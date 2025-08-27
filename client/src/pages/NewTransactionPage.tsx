import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import TransactionForm from "../components/forms/TransactionForm";

const NewTransactionPage = () => {
  const { t } = useTranslation();
  const { selectedAccountId } = useSelector((state: RootState) => state.ui);
  const selectedAccount = useSelector((state: RootState) =>
    state.auth.user?.accounts.find((acc) => acc.id === selectedAccountId)
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{t("transaction.title")}</h1>
      {selectedAccount ? (
        <div className="mb-6 text-text-secondary">
          <p>
            {t("transaction.sendingFrom")}:{" "}
            <strong>
              Ag. {selectedAccount.agency} / C.C. {selectedAccount.number}-
              {selectedAccount.digit}
            </strong>
          </p>
          <p>
            {t("transaction.currentBalance")}:{" "}
            <strong>
              {parseFloat(selectedAccount.balance).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </strong>
          </p>
        </div>
      ) : (
        <p className="mb-6 text-danger">{t("transaction.noAccountSelected")}</p>
      )}

      <div className="bg-surface p-6 rounded-lg shadow-md">
        {selectedAccount ? <TransactionForm /> : null}
      </div>
    </div>
  );
};

export default NewTransactionPage;
