import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AccountSelector from "./AccountSelector";
import BalanceCard from "./BalanceCard";
import type { RootState } from "../store";
import { useSelector } from "react-redux";
import { selectSelectedAccount } from "../store/slices/selectors";

const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block w-full text-left px-4 py-2 rounded-md transition-colors ${
    isActive
      ? "bg-primary-500 text-white font-semibold"
      : "text-text-secondary hover:bg-primary-100 hover:text-primary-500"
  }`;

const Sidebar = () => {
  const { t } = useTranslation();
  const { selectedAccountId } = useSelector((state: RootState) => state.ui);

  const selectedAccount = useSelector(selectSelectedAccount);

  const balance = parseFloat(selectedAccount?.balance || "0");

  return (
    <aside className="w-full md:w-64 bg-surface p-4 border-r flex flex-col h-full">
      <div className="flex-shrink-0">
        <h2 className="text-lg font-bold font-display mb-2 px-2">
          {t("sidebar.accounts")}
        </h2>
        <AccountSelector />
        {selectedAccountId && <BalanceCard balance={balance} />}
        <hr className="my-4 border-border" />
      </div>
      {selectedAccountId && (
        <nav className="flex flex-col space-y-2">
          <NavLink to="/overview" className={getNavLinkClass}>
            {t("sidebar.overview")}
          </NavLink>
          <NavLink to="/history" className={getNavLinkClass}>
            {t("sidebar.statement")}
          </NavLink>
          <NavLink to="/transactions/new" className={getNavLinkClass}>
            {t("sidebar.newTransaction")}
          </NavLink>
        </nav>
      )}
    </aside>
  );
};

export default Sidebar;
