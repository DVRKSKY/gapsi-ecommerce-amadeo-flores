import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

export type ResponsiveContainerProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children: ReactNode;
};

export function ResponsiveContainer({ children, className, ...rest }: ResponsiveContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}
      {...rest}
    >
      {children}
    </div>
  );
}
