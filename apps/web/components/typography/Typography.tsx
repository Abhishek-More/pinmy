import { cn } from "@/lib/utils";

type Variant = "h1" | "h2" | "h3" | "p" | "lead" | "large" | "small" | "muted";

const variantStyles: Record<Variant, string> = {
  h1: "scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-2xl",
  h2: "scroll-m-20 text-2xl font-semibold tracking-tight",
  h3: "scroll-m-20 text-xl font-semibold tracking-tight",
  p: "leading-7",
  lead: "text-xl text-muted-foreground",
  large: "text-lg font-semibold",
  small: "text-sm font-medium leading-none",
  muted: "text-sm text-muted-foreground",
};

const variantElements: Record<Variant, keyof React.JSX.IntrinsicElements> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  p: "p",
  lead: "p",
  large: "div",
  small: "small",
  muted: "p",
};

interface TypographyProps {
  variant?: Variant;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  children: React.ReactNode;
}

export function Typography({
  variant = "p",
  as,
  className,
  children,
}: TypographyProps) {
  const Component = as || variantElements[variant];
  return (
    <Component className={cn(variantStyles[variant], className)}>
      {children}
    </Component>
  );
}
