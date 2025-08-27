import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { createTransaction } from "../../store/slices/transactionSlice";
import Input from "../inputs/input";
import Button from "../Button";
import { cpfMask, agencyMask, accountMask } from "../../utils/masks";

const TransactionForm = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedAccountId } = useSelector((state: RootState) => state.ui);
  const { isLoading } = useSelector((state: RootState) => state.transactions);

  const [type, setType] = useState<"PIX" | "TED">("PIX");
  const [formData, setFormData] = useState({
    value: "",
    pixKey: "",
    recipientName: "",
    recipientDocument: "",
    recipientBank: "",
    recipientAgency: "",
    recipientAccount: "",
    transactionPassword: "",
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedAccountId) return;
    dispatch(
      createTransaction({ ...formData, type, accountId: selectedAccountId })
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex space-x-4">
        <Button
          type="button"
          onClick={() => setType("PIX")}
          variant={type === "PIX" ? "primary" : "secondary"}
        >
          PIX
        </Button>
        <Button
          type="button"
          onClick={() => setType("TED")}
          variant={type === "TED" ? "primary" : "secondary"}
        >
          TED
        </Button>
      </div>

      <Input
        label={t("transaction.form.value")}
        name="value"
        value={formData.value}
        onChange={handleInputChange}
        type="number"
        required
      />

      {type === "PIX" && (
        <Input
          label={t("transaction.form.pixKey")}
          name="pixKey"
          value={formData.pixKey}
          onChange={handleInputChange}
          required
        />
      )}

      {type === "TED" && (
        <>
          <Input
            label={t("transaction.form.recipientName")}
            name="recipientName"
            value={formData.recipientName}
            onChange={handleInputChange}
            required
          />
          <Input
            label={t("transaction.form.recipientDocument")}
            name="recipientDocument"
            value={formData.recipientDocument}
            onChange={handleInputChange}
            mask={cpfMask.mask}
            required
          />
          <Input
            label={t("transaction.form.recipientBank")}
            name="recipientBank"
            value={formData.recipientBank}
            onChange={handleInputChange}
            required
          />
          <Input
            label={t("transaction.form.recipientAgency")}
            name="recipientAgency"
            value={formData.recipientAgency}
            onChange={handleInputChange}
            mask={agencyMask.mask}
            required
          />
          <Input
            label={t("transaction.form.recipientAccount")}
            name="recipientAccount"
            value={formData.recipientAccount}
            onChange={handleInputChange}
            mask={accountMask.mask}
            required
          />
        </>
      )}

      <hr className="my-6" />

      <Input
        label={t("transaction.form.transactionPassword")}
        name="transactionPassword"
        type="password"
        value={formData.transactionPassword}
        onChange={handleInputChange}
        required
      />

      <Button
        type="submit"
        variant="primary"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading
          ? t("transaction.form.sending")
          : t("transaction.form.submit")}
      </Button>
    </form>
  );
};

export default TransactionForm;
