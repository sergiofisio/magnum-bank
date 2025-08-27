import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import type { AppDispatch, RootState } from "../store";
import { registerUser } from "../store/slices/authSlice";

import Input from "../components/inputs/input";
import Button from "../components/Button";
import { cpfMask, phoneMask, zipcodeMask } from "../utils/masks";
import { toast } from "react-toastify";
import LanguageSwitcher from "../components/LanguageSwitcher";

const RegisterPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cpf: "",
    password: "",
    confirmPassword: "",
    transactionPassword: "",
    phone: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
    zipcode: "",
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => setStep((prev) => prev + 1);
  const handlePrevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error(t("error.register.passwordMismatch"));
      return;
    }

    const apiData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      transactionPassword: formData.transactionPassword,
      documents: [{ type: "CPF", value: formData.cpf }],
      phones: [
        {
          type: "MOBILE",
          countryCode: 55,
          areaCode: parseInt(formData.phone.substring(1, 3)),
          number: formData.phone.substring(5).replace("-", ""),
        },
      ],
      addresses: [{ type: "RESIDENTIAL", ...formData }],
    };

    dispatch(registerUser(apiData)).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        navigate("/login");
      }
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="absolute top-10 right-5 flex flex-col items-center-safe justify-center gap-2">
        {t("header.language")}
        <LanguageSwitcher />
      </div>
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          {t("register.title")}
        </h2>
        <p className="text-center text-text-secondary mb-6">
          {t("register.step", { current: step, total: 3 })}
        </p>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <Input
                label={t("register.nameLabel")}
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <Input
                label={t("register.emailLabel")}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <Input
                label={t("register.cpfLabel")}
                name="cpf"
                value={formData.cpf}
                onChange={handleInputChange}
                mask={cpfMask}
                required
              />
            </>
          )}

          {step === 2 && (
            <>
              <Input
                label={t("register.passwordLabel")}
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <Input
                label={t("register.confirmPasswordLabel")}
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
              <Input
                label={t("register.transactionPasswordLabel")}
                type="password"
                name="transactionPassword"
                value={formData.transactionPassword}
                onChange={handleInputChange}
                required
              />
            </>
          )}

          {step === 3 && (
            <>
              <Input
                label={t("register.phoneLabel")}
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                mask={phoneMask}
                required
              />
              <Input
                label={t("register.zipcodeLabel")}
                name="zipcode"
                value={formData.zipcode}
                onChange={handleInputChange}
                mask={zipcodeMask}
                required
              />
              <Input
                label={t("register.streetLabel")}
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                required
              />
              <Input
                label={t("register.numberLabel")}
                name="number"
                value={formData.number}
                onChange={handleInputChange}
                required
              />
              <Input
                label={t("register.neighborhoodLabel")}
                name="neighborhood"
                value={formData.neighborhood}
                onChange={handleInputChange}
                required
              />
            </>
          )}

          {error && (
            <p className="text-red-500 text-xs italic my-4">{t(error)}</p>
          )}

          <div className="flex items-center justify-between mt-6 space-x-4">
            {step > 1 && (
              <Button
                type="button"
                variant="secondary"
                onClick={handlePrevStep}
              >
                {t("register.backButton")}
              </Button>
            )}
            {step < 3 && (
              <Button
                type="button"
                variant="primary"
                onClick={handleNextStep}
                className="w-full"
              >
                {t("register.nextButton")}
              </Button>
            )}
            {step === 3 && (
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading
                  ? t("register.loadingButton")
                  : t("register.submitButton")}
              </Button>
            )}
          </div>

          <p className="text-center text-sm text-text-secondary mt-4">
            {t("register.alreadyHaveAccount")}{" "}
            <Link
              to="/login"
              className="font-bold text-primary-500 hover:underline"
            >
              {t("register.loginLink")}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
