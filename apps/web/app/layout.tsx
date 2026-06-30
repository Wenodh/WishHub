import { type Metadata } from "next";
import "@wishhub/ui/styles/globals.css";

export const metadata: Metadata = {
  title: "WishHub",
  description: "Universal Wishlist Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
