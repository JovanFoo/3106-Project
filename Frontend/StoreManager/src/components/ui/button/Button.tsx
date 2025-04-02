import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode; // Button text or content
  size?: "sm" | "md"; // Button size
  variant?: "primary" | "outline"; // Button variant
  type?: "danger" | "success" | "warning" | "info" | "neutral";
  startIcon?: ReactNode; // Icon before the text
  endIcon?: ReactNode; // Icon after the text
  onClick?: () => void; // Click handler
  disabled?: boolean; // Disabled state
  className?: string; // Disabled state
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  type = "neutral",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
}) => {
  // Size Classes
  const sizeClasses = {
    sm: "px-4 py-3 text-sm",
    md: "px-5 py-3.5 text-sm",
  };
  const typeClasses = {
    danger: {
      bg: "bg-red-500",
      darkbg: "dark:bg-red-700",
      hoverbg: "hover:bg-red-200",
      darkhoverbg: "hover:dark:bg-red-200",

      text: "text-red-500",
      hovertext: "hover:text-red-600",
      darktext: "dark:text-red-500",
      darkhovertext: "dark:hover:text-red-500",

      ring: "ring-red-500",
      hoverring: "hover:ring-red-700",
      darkring: "dark:ring-red-700",
      darkhoverring: "hover:dark:ring-red-700",

      disabled: "red-200",
      shadow: "red-50",
    },
    success: {
      bg: "bg-green-500",
      darkbg: "dark:bg-green-700",
      hoverbg: "hover:bg-green-200",
      darkhoverbg: "hover:dark:bg-green-200",

      text: "text-green-500",
      hovertext: "hover:text-green-500",
      darktext: "dark:text-green-500",
      darkhovertext: "hover:dark:text-green-600",

      ring: "ring-green-500",
      hoverring: "hover:ring-green-700",
      darkring: "dark:ring-green-700",
      darkhoverring: "hover:dark:ring-green-700",

      disabled: "green-200",
      shadow: "green-50",
    },
    warning: {
      bg: "bg-yellow-500",
      darkbg: "dark:bg-yellow-700",
      hoverbg: "hover:bg-yellow-200",
      darkhoverbg: "hover:dark:bg-yellow-200",

      text: "text-yellow-500",
      hovertext: "hover:text-yellow-500",
      darktext: "dark:text-yellow-500",
      darkhovertext: "hover:dark:text-yellow-500",

      ring: "ring-yellow-500",
      hoverring: "hover:ring-yellow-700",
      darkring: "dark:ring-yellow-700",
      darkhoverring: "hover:dark:ring-yellow-700",

      disabled: "yellow-200",
      shadow: "yellow-50",
    },
    info: {
      bg: "bg-blue-500",
      darkbg: "dark:bg-blue-700",
      hoverbg: "hover:bg-blue-200",
      darkhoverbg: "hover:dark:bg-blue-200",

      text: "text-blue-500",
      hovertext: "hover:text-blue-500",
      darktext: "dark:text-blue-500",
      darkhovertext: "hover:dark:text-blue-500",

      ring: "ring-blue-500",
      hoverring: "hover:ring-blue-700",
      darkring: "dark:ring-blue-700",
      darkhoverring: "hover:dark:ring-blue-700",

      disabled: "ring-blue-200",
      shadow: "blue-50",
    },
    neutral: {
      bg: "bg-gray-500",
      darkbg: "dark:bg-gray-700",
      hoverbg: "hover:bg-gray-200",
      darkhoverbg: "hover:dark:bg-gray-200",

      text: "text-gray-500",
      hovertext: "hover:text-gray-500",
      darktext: "dark:text-gray-500",
      darkhovertext: "dark:hover:text-gray-500",

      ring: "ring-gray-500",
      hoverring: "hover:ring-gray-700",
      darkring: "dark:ring-gray-700",
      darkhoverring: "hover:dark:ring-gray-700",

      disabled: "gray-200",
      shadow: "gray-50",
    },
  };
  // Variant Classes
  const variantClasses = {
    primary: {
      normal: `text-white shadow-theme-xs hover:ring-1 
    ${typeClasses[type].bg}          ${typeClasses[type].darkbg}
    ${typeClasses[type].hoverbg}     ${typeClasses[type].darkhoverbg}
    ${typeClasses[type].hovertext}   ${typeClasses[type].darkhovertext}
    ${typeClasses[type].hoverring}   ${typeClasses[type].darkhoverring}  
    ${typeClasses[type].ring}        ${typeClasses[type].darkring}
    `,
      disabled: `text-white shadow-theme-xs  cursor-not-allowed opacity-50
    ${typeClasses[type].bg}          ${typeClasses[type].darkbg}
    ${typeClasses[type].ring}        ${typeClasses[type].darkring}
    `,
    },

    outline: {
      normal: `bg-transparent dark:bg-transparent ring-1 disabled:bg-transparent 
    ${typeClasses[type].text}    ${typeClasses[type].darktext}
    ${typeClasses[type].hoverbg} ${typeClasses[type].darkhoverbg} 
    ${typeClasses[type].ring}    ${typeClasses[type].darkring} 
    ${typeClasses[type].hovertext} ${typeClasses[type].darkhovertext} `,
      disabled: `bg-transparent dark:bg-transparent ring-1 disabled:bg-transparent cursor-not-allowed opacity-50
    ${typeClasses[type].text}    ${typeClasses[type].darktext}
    ${typeClasses[type].ring}    ${typeClasses[type].darkring}  `,
    },
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg transition font-semibold pl-3 pr-3 ${
        variantClasses[variant][disabled ? "disabled" : "normal"]
      }${sizeClasses[size]} ${className}`}
      // className={`inline-flex items-center justify-center gap-2 rounded-lg transition ${
      //   sizeClasses[size]
      // } ${variantClasses[variant]} ${
      //   disabled ? "cursor-not-allowed opacity-50" : ""
      // } ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export default Button;
