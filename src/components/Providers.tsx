"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "#2A1F17",
            color: "#F6F1E8",
            borderRadius: "2px",
            fontSize: "13px",
            fontFamily: "var(--font-jost)",
            letterSpacing: "0.02em",
            padding: "12px 18px",
          },
          success: { iconTheme: { primary: "#B08D4F", secondary: "#2A1F17" } },
          error: { iconTheme: { primary: "#9C4A2F", secondary: "#F6F1E8" } },
        }}
      />
    </SessionProvider>
  );
}
