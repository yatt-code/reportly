import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Assuming you have a global CSS file
import { AuthProvider } from "@/components/auth/AuthProvider";
import { NotificationProvider } from "@/contexts/NotificationContext"; // Import NotificationProvider
import { ThemeProvider } from "@/contexts/ThemeContext"; // Import ThemeProvider
import { WorkspaceProvider } from "@/contexts/WorkspaceContext"; // Import WorkspaceProvider
import { DemoProvider } from "@/contexts/DemoContext"; // Import DemoProvider
import DemoModeBanner from "@/components/demo/DemoModeBanner"; // Import DemoModeBanner
import { Toaster } from "react-hot-toast";

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
        {/* Wrap children with providers */}
        <AuthProvider>
          <DemoProvider>
            <ThemeProvider>
              <WorkspaceProvider>
                <NotificationProvider>
                  {/* Demo Mode Banner */}
                  <DemoModeBanner />
                  {children}
                  {/* Place Toaster here for app-wide notifications */}
                  <Toaster position="bottom-right" />
                </NotificationProvider>
              </WorkspaceProvider>
            </ThemeProvider>
          </DemoProvider>
        </AuthProvider>
      </body>
    </html>
  );
}