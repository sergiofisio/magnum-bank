import React from "react";
import { useTranslation } from "react-i18next";

const languages = [
  { code: "pt", name: "Português" },
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newLang = event.target.value;
    i18n.changeLanguage(newLang);
  };

  return (
    <div>
      <select
        value={i18n.language}
        onChange={handleLanguageChange}
        className="bg-surface border border-border text-text-primary text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher;
