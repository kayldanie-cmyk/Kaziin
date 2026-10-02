"use client";

import React, { useState, useRef, useEffect, Children, isValidElement } from "react";
import clsx from "clsx";

interface OptionProps {
  value?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export interface SelectProps {
  label?: string;
  error?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  name?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  onChange?: (e: { target: { value: string; name?: string } }) => void;
  "aria-label"?: string;
}

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  ({ label, error, onChange, value, defaultValue, className, id, name, children, placeholder, disabled, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentValue, setCurrentValue] = useState<string>(
      value ?? defaultValue ?? ""
    );
    const containerRef = useRef<HTMLDivElement>(null);
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    // Extract options from <option> children — drop-in replacement for native <select>
    const options: { value: string; label: React.ReactNode; disabled?: boolean }[] = [];

    Children.forEach(children, (child) => {
      if (isValidElement<OptionProps>(child) && child.type === "option") {
        options.push({
          value: (child.props.value ?? child.props.children ?? "") as string,
          label: child.props.children,
          disabled: child.props.disabled,
        });
      }
    });

    useEffect(() => {
      if (value !== undefined) setCurrentValue(value);
    }, [value]);

    useEffect(() => {
      const handleOutsideClick = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      if (isOpen) document.addEventListener("mousedown", handleOutsideClick);
      return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [isOpen]);

    const handleSelect = (val: string, optDisabled?: boolean) => {
      if (optDisabled) return;
      if (value === undefined) setCurrentValue(val);
      setIsOpen(false);
      if (onChange) {
        onChange({ target: { value: val, name } });
      }
    };

    const selectedOption = options.find((o) => o.value === currentValue);
    const displayLabel = selectedOption
      ? selectedOption.label
      : placeholder || (options[0] && options[0].label);

    return (
      <div className="flex flex-col gap-1.5" ref={containerRef}>
        {label && (
          <label htmlFor={selectId} className="text-[13.5px] font-medium text-ink">
            {label}
          </label>
        )}

        <div className="relative">
          <button
            ref={ref}
            type="button"
            id={selectId}
            aria-label={props["aria-label"]}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className={clsx(
              "w-full rounded-[10px] border bg-paper px-3.5 py-3 text-[14.5px] text-ink transition-colors flex items-center justify-between text-left",
              "focus:outline-none focus:ring-2 focus:ring-[#2F6D53]/30 focus:border-[#2F6D53]",
              disabled && "opacity-50 cursor-not-allowed",
              error ? "border-danger" : "border-line",
              className
            )}
            disabled={disabled}
          >
            <span className="truncate">{displayLabel || "\u00A0"}</span>
            <svg
              className={clsx("w-4 h-4 text-ink-soft shrink-0 transition-transform duration-200", isOpen && "rotate-180")}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isOpen && (
            <div
              role="listbox"
              className="absolute z-[9999] w-full mt-1 bg-paper border border-line rounded-[10px] shadow-xl overflow-hidden max-h-60 overflow-y-auto"
            >
              <ul className="py-1">
                {options.map((option, i) => {
                  const isSelected = option.value === currentValue;
                  return (
                    <li
                      key={i}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(option.value, option.disabled)}
                      className={clsx(
                        "px-3.5 py-2.5 text-[14px] cursor-pointer transition-colors select-none",
                        option.disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-[#2F6D53]/10 hover:text-[#2F6D53]",
                        isSelected ? "bg-[#2F6D53] text-white" : "text-ink"
                      )}
                    >
                      {option.label}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {error && (
          <p className="text-[12.5px] text-danger" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
