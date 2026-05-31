// src/components/Providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { AppProviders } from "../app/theme/providers";
import { NotificationProvider } from "./context/NotificationContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AppProviders>
        <NotificationProvider>{children}</NotificationProvider>
      </AppProviders>
    </SessionProvider>
  );
}
