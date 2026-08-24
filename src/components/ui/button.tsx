import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-all duration-200 ease-out active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-paper hover:bg-ink-soft shadow-[0_1px_0_rgba(255,255,255,0.08)_inset]",
  secondary:
    "bg-transparent text-ink border border-line-strong hover:border-ink hover:bg-surface-2",
  ghost: "bg-transparent text-ink-mute hover:text-ink",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-[0.9rem]",
  lg: "h-[3.25rem] px-7 text-[0.975rem]",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  href,
  ...rest
}: CommonProps & { href?: string } & Omit<
    ComponentProps<"button">,
    "className" | "children"
  >) {
  const cls = cn(base, variants[variant], sizes[size], className);
  if (href) {
    const external = href.startsWith("http") || href.startsWith("https://wa.me");
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
