import "./globals.css";
import React from "react";

export const metadata = {
  title: "WebRTC Video Chat",
  description: "Multi-peer WebRTC video chat"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}