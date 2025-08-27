import React from "react";
import { useTranslation } from "react-i18next";

interface BalanceCardProps {
  balance: number;
}

const localeMap: { [key: string]: string } = {
  pt: "pt-BR",
  en: "en-US",
  fr: "fr-FR",
};

const BalanceCard: React.FC<BalanceCardProps> = ({ balance }) => {
  const { t, i18n } = useTranslation(); // 👈 2. Inicialize o hook

  const currentLocale = localeMap[i18n.language] || "pt-BR";

  return (
    <div className="bg-surface p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-lg font-semibold text-text-secondary mb-2">
        {t("home.totalBalance")}
      </h2>
      <p className="text-2xl font-bold text-text-primary">
        {balance.toLocaleString(currentLocale, {
          style: "currency",
          currency: "BRL",
        })}
      </p>
    </div>
  );
};

export default BalanceCard;
