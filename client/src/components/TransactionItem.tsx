import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { format, type Locale } from "date-fns";
import { ptBR, enUS, fr } from "date-fns/locale";
import type { Transaction } from "../interface/types";
import type { RootState } from "../store";

const locales: { [key: string]: Locale } = { pt: ptBR, en: enUS, fr };

const TransactionItem: React.FC<{ tx: Transaction }> = ({ tx }) => {
  const { i18n, t } = useTranslation();
  const { selectedAccountId } = useSelector((state: RootState) => state.ui);
  const currentLocale = locales[i18n.language] || enUS;

  const isIncoming =
    tx.destinationAccountId === selectedAccountId || tx.type === "DEPOSIT";

  const formattedValue = parseFloat(tx.value).toLocaleString(i18n.language, {
    style: "currency",
    currency: "BRL",
  });
  const formattedDate = format(new Date(tx.date), "PP", {
    locale: currentLocale,
  });

  let displayName = tx.recipientName;
  if (isIncoming && tx.type !== "DEPOSIT") {
    displayName = tx.originAccount.user.name;
  }

  return (
    <li className="py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            isIncoming ? "bg-green-100" : "bg-red-100"
          }`}
        >
          <span
            className={`text-xl font-bold ${
              isIncoming ? "text-success" : "text-danger"
            }`}
          >
            {isIncoming ? "↓" : "↑"}
          </span>
        </div>
        <div>
          <p className="font-semibold text-text-primary">
            {t(`transaction.${isIncoming ? "receive" : "send"}`)}
            {displayName}
          </p>
          <p className="text-sm text-text-secondary">{formattedDate}</p>
        </div>
      </div>
      <p className={`font-bold ${isIncoming ? "text-success" : "text-danger"}`}>
        {isIncoming ? `+ ${formattedValue}` : `- ${formattedValue}`}
      </p>
    </li>
  );
};

export default TransactionItem;
