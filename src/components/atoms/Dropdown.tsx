import React, { useState, useRef, useEffect } from "react";

interface DropdownOption {
  value: string;
  label: string;
}

type DropdownVariant = "primary";

interface DropdownProps {
  variant?: DropdownVariant;
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export default function Dropdown({
  variant = "primary",
  options = [],
  value,
  onChange,
  label,
  placeholder = "Select",
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handles clicks outside dropdown element
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const baseStyles =
    "py-2 px-4 rounded-md transition w-full text-left flex justify-between items-center";
  const variantStyles: Record<DropdownVariant, string> = {
    primary: "bg-primary-fill outline-gray-stroke text-gray-text",
  };

  const [selectedLabel, setSelectedLabel] = useState(
    options.find((option) => option.value === value)?.label || placeholder
  );

  const handleOptionClick = (optionValue: string) => {
    if (onChange) {
      onChange(optionValue);
    } else {
      setSelectedLabel(
        options.find((option) => option.value === optionValue)?.label ||
          placeholder
      );
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && <label className="mb-1.5 flex">{label}</label>}
      <button
        type="button"
        className={`${baseStyles} ${variantStyles[variant]}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedLabel}</span>
        <div className="flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </button>
      <div
        className={`duration-200 absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-stroke ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      >
        <ul className="py-1">
          {options.map((option) => (
            <li
              key={option.value}
              className="px-4 py-2 text-gray-text hover:bg-primary-fill cursor-pointer"
              onClick={() => handleOptionClick(option.value)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
