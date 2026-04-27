import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GardenOS",
  description: "Automated garden monitoring & watering — project artifacts",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
