import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "cream" | "gold" | "ghost" | "double" | "double-solid" | "double-on-sage";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  /** Invisimple-style double border (default premium CTA) */
  double:
    "btn-double hover:-translate-y-0.5",
  "double-solid":
    "btn-double-solid hover:-translate-y-0.5",
  "double-on-sage":
    "btn-double-on-sage hover:-translate-y-0.5",
  primary:
    "bg-primary-dark text-cream shadow-[0_12px_32px_-12px_rgba(47,66,45,0.5)] hover:bg-primary hover:-translate-y-0.5",
  cream:
    "bg-cream/95 text-primary-dark border border-primary/15 hover:bg-white hover:-translate-y-0.5",
  outline:
    "border border-primary/25 bg-cream/70 text-primary-dark backdrop-blur-sm hover:bg-primary/8",
  gold: "bg-gradient-to-r from-gold to-gold-soft text-ink shadow-sm hover:brightness-105",
  ghost: "bg-transparent text-primary-dark hover:bg-primary/8",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3 text-[12.5px] tracking-[0.06em]",
};

export function Button({
  className,
  variant = "double",
  size = "md",
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 ease-out active:scale-[0.97] disabled:opacity-50 disabled:hover:translate-y-0",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}

export function LinkButton({
  href,
  className,
  variant = "double",
  size = "md",
  children,
  target,
  rel,
}: {
  href: string;
  className?: string;
  variant?: Variant;
  size?: Size;
  children: React.ReactNode;
  target?: string;
  rel?: string;
}) {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 ease-out active:scale-[0.97]",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </a>
  );
}
