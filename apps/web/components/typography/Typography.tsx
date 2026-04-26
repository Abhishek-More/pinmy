import { cn } from "@/lib/utils";

type Variant =
  | "h1"
  | "h2"
  | "h3"
  | "p"
  | "lead"
  | "large"
  | "small"
  | "muted"
  | "tag"
  | "label"
  | "detail"
  | "display";

const variantStyles: Record<Variant, string> = {
  h1: "scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-2xl",
  h2: "scroll-m-20 text-2xl font-bold tracking-tight",
  h3: "scroll-m-20 text-xl font-semibold tracking-tight",
  p: "leading-7 text-base",
  lead: "text-xl text-muted-foreground",
  large: "text-lg font-bold leading-tight",
  small: "text-xs font-medium leading-none",
  muted: "text-sm text-muted-foreground",
  tag: "text-xs font-bold tracking-wide uppercase leading-none",
  label: "text-xs font-medium tracking-widest uppercase leading-none",
  detail: "text-xs text-muted-foreground",
  display: "text-4xl font-bold tracking-tight",
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
  tag: "span",
  label: "span",
  detail: "span",
  display: "p",
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
