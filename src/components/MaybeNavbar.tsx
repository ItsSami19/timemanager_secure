// src/components/MaybeNavbar.tsx
"use client";
import Navbar from "./navbar";
import { usePathname } from "next/navigation";

export default function MaybeNavbar() {
  const path = usePathname();
  if (path === "/login" || path === "/auth/login") return null;
  return <Navbar />;
}
