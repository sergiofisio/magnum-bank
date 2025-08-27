import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-text-primary w-full min-h-16 flex justify-center items-center text-white">
      <p className="text-sm">© 2025 MagnumBank. {t("footer.text")}</p>
    </footer>
  );
};

export default Footer;
