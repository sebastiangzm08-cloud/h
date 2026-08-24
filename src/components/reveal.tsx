"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Aparición sutil al entrar en viewport (fade + desplazamiento hacia arriba).
 * Se dispara una sola vez; no se vuelve a animar al re-scrollear.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "span";
}) {
  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px", amount: 0.15 }}
      transition={{ duration: 0.7, delay: delay / 1000, ease: [0.25, 1, 0.5, 1] }}
    >
      {children}
    </MotionTag>
  );
}
