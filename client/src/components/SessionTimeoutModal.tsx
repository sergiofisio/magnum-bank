import React from "react";
import Modal from "react-modal";
import { useTranslation } from "react-i18next";
import Button from "./Button";

interface SessionTimeoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel={t("header.sessionExpired")}
      className="bg-surface rounded-lg shadow-lg p-6 max-w-sm mx-auto my-20 outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <h2 className="text-xl font-bold mb-4">{t("header.sessionExpired")}</h2>
      <p className="text-text-secondary mb-6">
        {t("header.sessionExpiredMessage")}
      </p>
      <Button onClick={onClose} variant="primary" className="w-full">
        OK
      </Button>
    </Modal>
  );
};

export default SessionTimeoutModal;
