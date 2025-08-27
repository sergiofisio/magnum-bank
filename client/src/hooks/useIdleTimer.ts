import { useState, useEffect, useCallback } from "react";

export const useIdleTimer = (timeout: number, onIdle: () => void) => {
  const [remainingTime, setRemainingTime] = useState(timeout);

  const resetTimer = useCallback(() => {
    setRemainingTime(timeout);
  }, [timeout]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(interval);
          onIdle();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onIdle]);

  return { remainingTime, resetTimer };
};
