import { useTranslation } from "react-i18next";
import { format, type Locale } from "date-fns";
import { ptBR, enUS, fr } from "date-fns/locale";

import TransactionItem from "./TransactionItem";
import type { DailyGroup } from "../hooks/useGroupedTransactions";
import type { TransactionType } from "../interface/types";
import type { FC } from "react";

const locales: { [key: string]: Locale } = { pt: ptBR, en: enUS, fr };

const DailyTransactionGroup: FC<{ group: DailyGroup }> = ({ group }) => {
  const { t, i18n } = useTranslation();
  const currentLocale = locales[i18n.language] || enUS;

  const transactionTypes = Object.keys(
    group.transactionsByType
  ) as TransactionType[];

  return (
    <div className="mb-6 bg-surface p-4 rounded-lg shadow-sm">
      <div className="bg-background p-2 rounded-md mb-2">
        <p className="font-bold text-sm text-text-primary">
          {format(new Date(group.date), "dd 'de' MMMM, yyyy", {
            locale: currentLocale,
          })}
        </p>
        <div className="flex justify-between text-xs text-text-secondary mt-1">
          <span>
            {t("history.previousBalance")}:{" "}
            {group.startingBalance.toLocaleString(i18n.language, {
              style: "currency",
              currency: "BRL",
            })}
          </span>
          <span>
            {t("history.dayEndBalance")}:{" "}
            {group.endingBalance.toLocaleString(i18n.language, {
              style: "currency",
              currency: "BRL",
            })}
          </span>
        </div>
      </div>

      {transactionTypes.map((type) => (
        <div key={type} className="mt-2">
          <h4 className="font-semibold text-sm text-text-primary border-b pb-1 mb-1">
            {type}
          </h4>
          <ul className="divide-y divide-border">
            {group.transactionsByType[type].map((tx) => (
              <TransactionItem key={tx.id} tx={tx} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default DailyTransactionGroup;
