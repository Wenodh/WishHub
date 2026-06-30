import { type Metadata } from "next";
import "@wishhub/ui/styles/globals.css";
import { QueryProvider } from "../providers/query-provider";

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
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
