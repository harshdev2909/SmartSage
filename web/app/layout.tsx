import { AuthProvider } from "@/context/AuthProvider";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SmartSage",
  description: "Real-time group chat application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
