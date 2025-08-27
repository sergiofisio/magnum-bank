import { useState, forwardRef } from "react";
import { IMaskInput } from "react-imask";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import type { HTMLInputTypeAttribute, ChangeEvent } from "react";

type InputProps = {
  label: string;
  id?: string;
  name?: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  type?: HTMLInputTypeAttribute;
  mask?: any;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, id, name, type = "text", mask, className, onChange, ...props },
    ref
  ) => {
    const inputId = id || name;
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const inputType = type === "password" && isPasswordVisible ? "text" : type;

    return (
      <div className="mb-4">
        <label
          htmlFor={inputId}
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          {label}
        </label>
        <div className="relative">
          <IMaskInput
            {...props}
            id={inputId}
            name={name}
            type={inputType}
            inputRef={ref}
            mask={mask}
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              type === "password" ? "pr-10" : ""
            } ${className}`}
            // 👇 CORREÇÃO: Usamos onAccept para valores com máscara e onChange para valores sem máscara
            onAccept={
              // Se houver máscara, onAccept nos dá o valor limpo (unmasked)
              mask
                ? (unmaskedValue) => {
                    const syntheticEvent = {
                      target: { name, value: unmaskedValue },
                    } as ChangeEvent<HTMLInputElement>;
                    onChange?.(syntheticEvent);
                  }
                : undefined // Se não houver máscara, não usamos onAccept
            }
            onChange={
              // Se NÃO houver máscara, usamos o onChange padrão
              !mask ? onChange : undefined
            }
          />
          {type === "password" && (
            <button
              type="button"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-700 hover:text-gray-900"
              aria-label={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
            >
              {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
            </button>
          )}
        </div>
      </div>
    );
  }
);

export default Input;
