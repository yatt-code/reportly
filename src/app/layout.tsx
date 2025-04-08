import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Assuming you have a global CSS file
import { AuthProvider } from "@/components/auth/AuthProvider"; // Import the provider
import { Toaster } from "react-hot-toast"; // Import Toaster for notifications

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reportly", // Default title
  description: "AI-Powered Reporting Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Wrap children with AuthProvider */}
        <AuthProvider>
          {children}
          {/* Place Toaster here for app-wide notifications */}
          <Toaster position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  );
}