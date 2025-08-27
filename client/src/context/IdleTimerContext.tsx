import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useIdleTimer } from "../hooks/useIdleTimer";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/slices/authSlice";
import type { AppDispatch } from "../store";
import SessionTimeoutModal from "../components/SessionTimeoutModal";

interface IdleTimerContextType {
  remainingTime: number;
  resetTimer: () => void;
}

const IdleTimerContext = createContext<IdleTimerContextType | null>(null);

export const IdleTimerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleIdle = () => {
    setIsModalOpen(true);
  };

  const handleLogoutAndClose = () => {
    setIsModalOpen(false);
    dispatch(logout());
    navigate("/login");
  };

  const INACTIVITY_TIMEOUT = 600;
  const { remainingTime, resetTimer } = useIdleTimer(
    INACTIVITY_TIMEOUT,
    handleIdle
  );

  useEffect(() => {
    resetTimer();
  }, [location.pathname, resetTimer]);

  return (
    <IdleTimerContext.Provider value={{ remainingTime, resetTimer }}>
      {children}
      <SessionTimeoutModal
        isOpen={isModalOpen}
        onClose={handleLogoutAndClose}
      />
    </IdleTimerContext.Provider>
  );
};

export const useIdleTimerContext = () => {
  const context = useContext(IdleTimerContext);
  if (!context) {
    throw new Error(
      "useIdleTimerContext deve ser usado dentro de um IdleTimerProvider"
    );
  }
  return context;
};
