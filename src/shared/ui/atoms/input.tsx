import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/shared/utils/cn";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  invalid?: boolean;
  className?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, type = "text", ...props },
  ref
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm shadow-sm transition-[box-shadow,color,background,border]",
        "text-neutral-900 placeholder:text-neutral-400",
        "focus-visible:border-neutral-900 focus-visible:ring-[3px] focus-visible:ring-neutral-900/10 focus-visible:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-50 dark:placeholder:text-neutral-500 dark:focus-visible:border-white dark:focus-visible:ring-white/10",
        invalid && "border-red-600 focus-visible:border-red-700 focus-visible:ring-red-500/15 dark:border-red-500",
        className
      )}
      {...props}
    />
  );
});
