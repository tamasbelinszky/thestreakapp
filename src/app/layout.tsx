import type { Metadata } from "next";
import { Inter } from "next/font/google";

import AuthContext from "./AuthContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Streak App | Streaks Unleashed!",
  description: "Create streaks and track your progress. How long can you go?",
  applicationName: "thestreakapp",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="flex min-h-screen w-full flex-col p-4 lg:p-8">
          <AuthContext>{children}</AuthContext>
        </main>
      </body>
    </html>
  );
}
