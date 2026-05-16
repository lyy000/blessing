import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "曼桢 · 心念祈福",
  description: "为李曼桢送上心念与祝福，愿她感冒快快好起来。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
