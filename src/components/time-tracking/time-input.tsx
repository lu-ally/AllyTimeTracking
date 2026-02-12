"use client";

import { Input } from "@/components/ui/input";
import { useRef } from "react";

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function TimeInput({
  value,
  onChange,
  onBlur,
  onKeyDown,
  placeholder = "HH:mm",
  disabled,
  className,
}: TimeInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    let v = e.target.value.replace(/[^\d:]/g, "");

    // Auto-insert colon after 2 digits
    if (v.length === 2 && !v.includes(":") && value.length < v.length) {
      v = v + ":";
    }

    // Limit to 5 chars (HH:mm)
    if (v.length > 5) return;

    onChange(v);
  }

  function handleBlur() {
    // Pad single-digit hour: "9:00" -> "09:00"
    const match = value.match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
      const padded = match[1].padStart(2, "0") + ":" + match[2];
      if (padded !== value) {
        onChange(padded);
      }
    }
    onBlur?.();
  }

  return (
    <Input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-20 text-center font-mono ${className ?? ""}`}
    />
  );
}
