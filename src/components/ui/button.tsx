import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "primary"
  | "secondary"
  | "ghost"
  /* Para usar sobre fondos oscuros */
  | "inverse"
  | "secondaryDark"
  /* Para usar sobre una superficie `bg-ink` (tarjeta destacada) */
  | "onInk";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-all duration-200 ease-out active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap";

/* Solo blanco y negro (2026-10-20): el hover no aclara ni oscurece, INVIERTE.
   Cada botón lleva un borde de su propio color para que, al invertirse, el
   contorno siga marcando dónde está. */
const variants: Record<Variant, string> = {
  primary: "border border-ink bg-ink text-paper hover:bg-paper hover:text-ink",
  secondary:
    "border border-ink bg-transparent text-ink hover:bg-ink hover:text-paper",
  ghost: "bg-transparent text-ink underline-offset-4 hover:underline",
  /* Van sobre secciones `noche`, que no se invierten con el tema. */
  inverse:
    "border border-noche-texto bg-noche-texto text-noche hover:bg-noche hover:text-noche-texto",
  secondaryDark:
    "border border-noche-texto bg-transparent text-noche-texto hover:bg-noche-texto hover:text-noche",
  /* El color contrario al de la tarjeta, en cualquier tema: así el CTA
     nunca queda del mismo tono que su fondo. */
  onInk: "border border-paper bg-paper text-ink hover:bg-ink hover:text-paper",
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
