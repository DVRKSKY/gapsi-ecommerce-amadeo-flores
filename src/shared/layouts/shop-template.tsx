import type { ReactNode } from "react";
import { ResponsiveContainer } from "@/shared/ui/layout/responsive-container";
import { StoreShell } from "@/shared/layouts/store-shell";

export type ShopTemplateProps = {
  children: ReactNode;
};

export function ShopTemplate({ children }: ShopTemplateProps) {
  return (
    <StoreShell>
      <ResponsiveContainer className="py-8 lg:py-10">{children}</ResponsiveContainer>
    </StoreShell>
  );
}
