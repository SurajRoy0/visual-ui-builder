"use client";

import React, { useId } from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CSSUnit = "px" | "%" | "rem" | "em" | "vw" | "vh" | "auto" | "none" | "fr" | "pt";

export interface UnitInputProps {
  id?: string;
  value?: string | number;
  unit?: CSSUnit;
  onChange?: (val: string) => void;
  onValueChange?: (numVal: string, unit: CSSUnit) => void;
  units?: CSSUnit[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  prefixIcon?: React.ReactNode;
  prefixLabel?: string;
  className?: string;
  allowNegative?: boolean;
}

const DEFAULT_UNITS: CSSUnit[] = ["px", "%", "rem", "em", "vw", "vh", "auto"];

export function parseValueAndUnit(raw: string | number | undefined, defaultUnit: CSSUnit = "px"): {
  numericValue: string;
  unit: CSSUnit;
} {
  if (raw === undefined || raw === null || raw === "") {
    return { numericValue: "", unit: defaultUnit };
  }

  const str = String(raw).trim().toLowerCase();

  if (str === "auto") {
    return { numericValue: "", unit: "auto" };
  }
  if (str === "none") {
    return { numericValue: "", unit: "none" };
  }

  // Regex matching number and optional unit suffix
  const match = str.match(/^(-?[\d.]+)\s*(px|%|rem|em|vw|vh|fr|pt)?$/);
  if (match) {
    const num = match[1];
    const u = (match[2] as CSSUnit) || defaultUnit;
    return { numericValue: num, unit: u };
  }

  // Fallback: extract digits/decimals
  const numericOnly = str.replace(/[^\d.-]/g, "");
  return { numericValue: numericOnly, unit: defaultUnit };
}

export const UnitInput: React.FC<UnitInputProps> = ({
  id,
  value,
  unit,
  onChange,
  onValueChange,
  units = DEFAULT_UNITS,
  placeholder = "0",
  min,
  max,
  step = 1,
  disabled = false,
  prefixIcon,
  prefixLabel,
  className,
  allowNegative = true,
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  // Derive current numeric value and unit
  const parsed = parseValueAndUnit(value, unit || "px");
  const currentUnit: CSSUnit = unit || parsed.unit;
  const currentNumeric = currentUnit === "auto" || currentUnit === "none" ? "" : parsed.numericValue;

  const handleNumberChange = (rawInput: string) => {
    // Sanitize: strictly allow only numbers, decimal point, and optional leading negative sign
    let clean = rawInput.replace(/[^0-9.-]/g, "");

    if (!allowNegative && clean.startsWith("-")) {
      clean = clean.replace("-", "");
    }

    // Ensure only one decimal point
    const parts = clean.split(".");
    if (parts.length > 2) {
      clean = parts[0] + "." + parts.slice(1).join("");
    }

    // Ensure negative sign is only at the beginning
    if (clean.includes("-") && clean.indexOf("-") !== 0) {
      clean = clean.replace(/-/g, "");
    }

    const newUnit = currentUnit === "auto" || currentUnit === "none" ? (units[0] === "auto" ? "px" : units[0]) : currentUnit;

    const formatted = clean === "" ? "" : `${clean}${newUnit}`;

    if (onChange) {
      onChange(formatted);
    }
    if (onValueChange) {
      onValueChange(clean, newUnit);
    }
  };

  const handleUnitChange = (newUnit: CSSUnit) => {
    let formatted = "";
    if (newUnit === "auto") {
      formatted = "auto";
    } else if (newUnit === "none") {
      formatted = "none";
    } else {
      const num = currentNumeric || "0";
      formatted = `${num}${newUnit}`;
    }

    if (onChange) {
      onChange(formatted);
    }
    if (onValueChange) {
      onValueChange(currentNumeric, newUnit);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (currentUnit === "auto" || currentUnit === "none" || disabled) return;

    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const currentNum = parseFloat(currentNumeric) || 0;
      const stepMultiplier = e.shiftKey ? 10 : 1;
      const delta = (e.key === "ArrowUp" ? step : -step) * stepMultiplier;
      let nextNum = currentNum + delta;

      if (min !== undefined) nextNum = Math.max(min, nextNum);
      if (max !== undefined) nextNum = Math.min(max, nextNum);

      // Round to 2 decimal places to avoid float precision issues
      const formattedNum = String(Math.round(nextNum * 100) / 100);
      handleNumberChange(formattedNum);
    }
  };

  const isKeywordUnit = currentUnit === "auto" || currentUnit === "none";

  return (
    <div
      className={cn(
        "group relative flex items-center h-7 w-full rounded-md border border-input bg-background/50 hover:bg-background focus-within:bg-background focus-within:ring-1 focus-within:ring-ring transition-all overflow-hidden shadow-2xs",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      {/* Optional Prefix Icon or Label */}
      {prefixIcon && (
        <span className="flex items-center justify-center pl-2 text-muted-foreground shrink-0 select-none">
          {prefixIcon}
        </span>
      )}
      {prefixLabel && (
        <span className="flex items-center justify-center pl-2 text-[10px] font-mono text-muted-foreground shrink-0 select-none">
          {prefixLabel}
        </span>
      )}

      {/* Numerical Value Input */}
      <input
        id={inputId}
        type="text"
        inputMode="decimal"
        disabled={disabled || isKeywordUnit}
        value={isKeywordUnit ? currentUnit : currentNumeric}
        placeholder={isKeywordUnit ? currentUnit : placeholder}
        onChange={(e) => handleNumberChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full h-full bg-transparent px-2 text-xs font-mono text-foreground placeholder:text-muted-foreground/60 outline-none border-none",
          isKeywordUnit && "italic text-muted-foreground capitalize font-sans"
        )}
      />

      {/* Unit Selector */}
      <div className="shrink-0 h-full border-l border-border/60 flex items-center bg-secondary/30">
        <Select
          value={currentUnit}
          onValueChange={(val) => handleUnitChange(val as CSSUnit)}
          disabled={disabled}
        >
          <SelectTrigger
            aria-label="Select Unit"
            className="h-full border-none shadow-none bg-transparent px-1.5 py-0 text-[10px] font-mono font-medium text-muted-foreground hover:text-foreground focus:ring-0 rounded-none cursor-pointer gap-0.5"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end" className="min-w-20">
            {units.map((u) => (
              <SelectItem key={u} value={u} className="text-xs font-mono py-1">
                {u}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
