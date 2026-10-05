import { Geist, Geist_Mono } from "next/font/google";

/* Las fuentes se declaran UNA vez y las usan los layouts raíz de los dos
   idiomas (`(es)/layout.tsx` y `(en)/layout.tsx`). */
export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});
