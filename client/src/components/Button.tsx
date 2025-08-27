import type React from "react";
import { useIdleTimerContext } from "../context/IdleTimerContext";

type ButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "secondary" | "danger";
};

const Button = ({
  children,
  className,
  variant = "primary",
  onClick,
  ...props
}: ButtonProps) => {
  const { resetTimer } = useIdleTimerContext();

  const baseStyles =
    "font-bold py-2 px-4 w-40 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    resetTimer();
    onClick?.(event);
  };

  return (
    <button
      className={`${baseStyles} ${
        variant === "primary"
          ? "bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500"
          : ""
      } ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
