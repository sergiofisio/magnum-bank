import React from "react";
import { useTranslation } from "react-i18next";

interface PeriodFilterProps {
  period: string;
  onPeriodChange: (newPeriod: string) => void;
}

const PeriodFilter: React.FC<PeriodFilterProps> = ({
  period,
  onPeriodChange,
}) => {
  const { t } = useTranslation();

  const periods = [
    { label: t("history.filter.last7days"), value: "7d" },
    { label: t("history.filter.last15days"), value: "15d" },
    { label: t("history.filter.last30days"), value: "30d" },
    { label: t("history.filter.last90days"), value: "90d" },
  ];

  return (
    <select
      value={period}
      onChange={(e) => onPeriodChange(e.target.value)}
      className="w-full md:w-56 p-2 border border-border rounded-md bg-surface"
    >
      {periods.map((p) => (
        <option key={p.value} value={p.value}>
          {p.label}
        </option>
      ))}
    </select>
  );
};

export default PeriodFilter;
