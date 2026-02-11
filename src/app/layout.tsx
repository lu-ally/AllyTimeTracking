import type { Metadata } from "next";
import { dmSerifText, urbanist } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "AllyTimeTracking",
  description: "Zeiterfassung und Urlaubsplanung",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${dmSerifText.variable} ${urbanist.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
