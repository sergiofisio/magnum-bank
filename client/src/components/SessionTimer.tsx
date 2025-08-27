import { useTranslation } from "react-i18next";
import { useIdleTimerContext } from "../context/IdleTimerContext";

const SessionTimer = () => {
  const { t } = useTranslation();

  const { remainingTime } = useIdleTimerContext();

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;

  const isEndingSoon = remainingTime <= 60;

  return (
    <div className="flex flex-col items-center">
      <span
        className={`font-mono text-lg font-bold ${
          isEndingSoon ? "text-danger" : "text-text-secondary"
        }`}
      >
        {formattedTime}
      </span>
      {isEndingSoon && (
        <span className="text-xs text-danger animate-pulse">
          {t("header.sessionEnding")}
        </span>
      )}
    </div>
  );
};

export default SessionTimer;
