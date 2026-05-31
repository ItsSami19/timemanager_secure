"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Container,
  CssBaseline,
  useTheme,
  IconButton,
} from "@mui/material";
import { Brightness7, Brightness4 } from "@mui/icons-material";
import { useColorMode } from "../../theme/providers";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/";

  const theme = useTheme();
  const { toggleColorMode } = useColorMode();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(""); // Reset error
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl,
    });

    if (res?.error) {
      setErrorMessage("Invalid email or password.");
    } else {
      router.push(callbackUrl);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    alert("Please send an email to hr@stc.com");
  };

  const [errorMessage, setErrorMessage] = useState("");

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 3,
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Typography
          component="h1"
          variant="h5"
          sx={{ color: theme.palette.text.primary }}
        >
          Login
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 1, width: "100%" }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              backgroundColor: theme.palette.background.default,
              borderRadius: 1,
              "& .MuiInputBase-root": {
                color: theme.palette.text.primary,
              },
            }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              backgroundColor: theme.palette.background.default,
              borderRadius: 1,
              "& .MuiInputBase-root": {
                color: theme.palette.text.primary,
              },
            }}
          />
          {errorMessage && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {errorMessage}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.background.paper,
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            Sign In
          </Button>

          <Box textAlign="center">
            <Link
              href="#"
              variant="body2"
              onClick={handleForgotPassword}
              sx={{ color: theme.palette.text.secondary, cursor: "pointer" }}
            >
              Forgot password?
            </Link>
          </Box>
        </Box>

        <Box
          sx={{
            position: "absolute",
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
      </Box>
    </Container>
  );
}
