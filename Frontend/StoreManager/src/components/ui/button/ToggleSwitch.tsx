import { useState } from "react";

interface ToggleSwitchProps {
    checked?: boolean; // Initial state
    onChange?: (checked: boolean) => void; // Change handler
    size?: "sm" | "md"; // Size options
    disabled?: boolean; // Disabled state
    className?: string; // Custom class names
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
    checked = false,
    onChange,
    size = "md",
    disabled = false,
    className = "",
}) => {
    const [isChecked, setIsChecked] = useState(checked);

    const handleToggle = () => {
        if (disabled) return;
        setIsChecked((prev) => !prev);
        if (onChange) onChange(!isChecked);
    };

    // Size classes
    const sizeClasses = {
        sm: "w-10 h-5",
        md: "w-12 h-6",
    };

    return (
        <button
            onClick={handleToggle}
            disabled={disabled}
            className={`relative flex items-center rounded-full transition-colors ${isChecked ? "bg-blue-500" : "bg-gray-300"
                } ${sizeClasses[size]} ${disabled ? "cursor-not-allowed opacity-50" : "hover:bg-gray-400"} ${className}`}
        >
            <div
                className={`absolute left-1 top-1 h-4 w-4 bg-white rounded-full shadow-md transform transition-transform ${isChecked ? "translate-x-6" : "translate-x-0"
                    } ${size === "sm" ? "w-3.5 h-3.5 translate-x-4" : ""}`}
            />
        </button>
    );
};

export default ToggleSwitch;
