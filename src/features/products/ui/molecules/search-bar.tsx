"use client";

import { useState, type FormEvent, type InputHTMLAttributes, type SVGProps } from "react";
import { Button } from "@/shared/ui/atoms/button";
import { Input } from "@/shared/ui/atoms/input";
import { cn } from "@/shared/utils/cn";

export type SearchBarProps = {
  name?: string;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  onSearch?: (trimmedQuery: string) => void;
  className?: string;
  inputProps?: Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "name" | "placeholder" | "type">;
};

function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-4" {...props}>
      <path
        className="stroke-current"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M10.75 18.25a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
      />
      <path
        className="stroke-current"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M16.65 16.65 21 21"
      />
    </svg>
  );
}

export function SearchBar({
  name = "q",
  placeholder = "Buscar en el catálogo",
  defaultValue,
  value,
  onValueChange,
  onSearch,
  className,
  inputProps,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const isControlled = value !== undefined;
  const draft = isControlled ? value : internalValue;

  function setDraft(next: string) {
    if (isControlled) {
      onValueChange?.(next);
    } else {
      setInternalValue(next);
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSearch?.(draft.trim());
  }

  return (
    <form
      className={cn("flex w-full items-center gap-2", className)}
      onSubmit={handleSubmit}
      role="search"
    >
      <Input
        {...inputProps}
        name={name}
        placeholder={placeholder}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        type="search"
        autoComplete="off"
        spellCheck={false}
        className="min-w-0 flex-1"
      />
      <Button type="submit" variant="primary" size="md" className="shadow-sm" aria-label="Buscar">
        <SearchIcon />
      </Button>
    </form>
  );
}
