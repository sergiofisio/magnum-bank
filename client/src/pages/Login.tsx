import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../store/slices/authSlice";
import { useTranslation } from "react-i18next";
import type { AppDispatch, RootState } from "../store";
import Input from "../components/inputs/input";
import { cpfMask } from "../utils/masks";

const LoginPage = () => {
  const { t } = useTranslation();
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { isLoading, isAuthenticated, error } = useSelector(
    (state: RootState) => state.auth
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    dispatch(login({ cpf, password }));
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex items-center justify-center h-full bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          {t("login.title")}
        </h2>
        <form onSubmit={handleSubmit}>
          <Input
            label={t("login.cpfLabel")}
            id="cpf"
            name="cpf"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            mask={cpfMask.mask}
            required
          />
          <Input
            label={t("login.passwordLabel")}
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-red-500 text-xs italic mb-4">{t(error)}</p>
          )}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
            >
              {isLoading ? t("login.loadingButton") : t("login.submitButton")}
            </button>
          </div>
        </form>
        <p className="text-center text-sm text-text-secondary mt-4">
          {t("register.alreadyHaveAccount")}{" "}
          <Link
            to="/register"
            className="font-bold text-primary-500 hover:underline"
          >
            {t("register.registerLink")}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
