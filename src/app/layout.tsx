// src/app/layout.tsx
import MaybeNavbar from "../components/MaybeNavbar";
import { Providers } from "../components/Providers";

export const metadata = {
  title: "TimeManager",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Providers ist eine Client Component */}
        <Providers>
          <MaybeNavbar />
          <main style={{ padding: "1rem" }}>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
