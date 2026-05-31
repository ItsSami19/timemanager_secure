"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import {
  AccountCircle,
  Logout,
  Brightness7,
  Brightness4,
} from "@mui/icons-material";
import { useColorMode } from "../app/theme/providers";
import NotificationButton from "./context/NotificationButton";

const Navbar = () => {
  const [isMounted, setIsMounted] = useState(false);
  const theme = useTheme();
  const { toggleColorMode } = useColorMode();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const navLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Absence", href: "/absence" },
    { label: "Time Account", href: "/timeaccount/" },
    { label: "Vacations", href: "/vacations" },
  ];

  const isDark = theme.palette.mode === "dark";
  const tabBg = isDark ? "#fff" : "#000";
  const tabColor = isDark ? "#000" : "#fff";

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        }}
      >
        {/* Top Bar */}
        <Toolbar
          sx={{ display: "flex", justifyContent: "space-between", px: 2 }}
        >
          {/* Left: TimeManager */}
          <Typography
            variant="h6"
            sx={{
              fontFamily: "monospace",
              fontWeight: "bold",
              color: theme.palette.text.primary,
            }}
          >
            TimeManager
          </Typography>

          {/* Center: STC Logo */}
          <Typography
            variant="h6"
            sx={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              fontFamily: "monospace",
              fontWeight: "bold",
              color: theme.palette.text.primary,
            }}
          >
            STC
          </Typography>

          {/* Right: Icons */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <NotificationButton />

            <IconButton sx={{ color: theme.palette.text.primary }}>
              <AccountCircle
                sx={{ color: theme.palette.text.primary }}
                onClick={() =>
                  (window.location.href = "/dashboard/employee/employeestat")
                }
              />
            </IconButton>
            <IconButton
              sx={{ color: theme.palette.text.primary }}
              onClick={() => (window.location.href = "/login")}
            >
              <Logout />
            </IconButton>
          </Box>
        </Toolbar>

        {/* Tabs – now aligned left */}
        <Toolbar
          sx={{
            display: "flex",
            gap: 2,
            backgroundColor: theme.palette.background.default,
            justifyContent: "flex-start",
            py: 1,
            px: 2,
          }}
        >
          {navLinks.map((link) => (
            <Button
              key={link.href}
              component={Link}
              href={link.href}
              sx={{
                backgroundColor: tabBg,
                color: tabColor,
                px: 3,
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                boxShadow: 1,
                "&:hover": {
                  backgroundColor: isDark ? "#ddd" : "#333",
                  color: isDark ? "#000" : "#fff",
                  transform: "scale(1.05)",
                },
              }}
            >
              {link.label}
            </Button>
          ))}
        </Toolbar>
      </AppBar>

      {/* Dark/Light Toggle */}
      <Box
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 2000,
          backgroundColor: theme.palette.background.paper,
          borderRadius: "50%",
          boxShadow: 2,
        }}
      >
        <IconButton
          onClick={toggleColorMode}
          sx={{ color: theme.palette.text.primary }}
        >
          {theme.palette.mode === "dark" ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
      </Box>

      <Toolbar />
      <Toolbar />
    </>
  );
};

export default Navbar;
