import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/slices/authSlice";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import Button from "./Button";
import LanguageSwitcher from "./LanguageSwitcher";
import type { AppDispatch, RootState } from "../store";
import SessionTimer from "./SessionTimer";

const Header = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const handleLogout = () => {
    dispatch(logout());
    toast.info(t("logout.success"));
    navigate("/login");
    localStorage.clear();
  };

  const getFirstName = (name: string | undefined) => {
    if (!name) return "";
    return name.split(" ")[0];
  };

  return (
    <header className="bg-surface shadow-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold font-display text-primary-500">
          Magnum Bank
        </h1>
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />

          {isAuthenticated && (
            <>
              <SessionTimer />
              <span className="text-text-secondary w-40 text-center hidden sm:block">
                {t("header.greeting")}, {getFirstName(user?.name)}
              </span>
              <Button onClick={handleLogout} variant="primary">
                {t("header.logoutButton")}
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
