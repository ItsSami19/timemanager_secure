"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Paper,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/navigation";

type Employee = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function TeamStatisticsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const theme = useTheme();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/team-stat");
        if (!res.ok) throw new Error(`Status ${res.status}`);
        setEmployees(await res.json());
      } catch (err) {
        console.error("Fetch Team-Stat failed:", err);
      }
    })();
  }, []);

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: 4, bgcolor: theme.palette.background.default }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: theme.palette.text.primary }}
      >
        Team Statistics
      </Typography>

      <TextField
        fullWidth
        placeholder="🔍 E‑Mail / Name"
        variant="outlined"
        sx={{
          mb: 3,
          input: { color: theme.palette.text.primary },
          fieldset: { borderColor: theme.palette.text.primary },
        }}
        onChange={(e) => setSearch(e.target.value)}
      />

      <TableContainer
        component={Paper}
        sx={{ bgcolor: theme.palette.background.paper }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{ fontWeight: "bold", color: theme.palette.text.primary }}
              >
                ID
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", color: theme.palette.text.primary }}
              >
                Name
              </TableCell>
              <TableCell
                sx={{ fontWeight: "bold", color: theme.palette.text.primary }}
              >
                Role
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontWeight: "bold", color: theme.palette.text.primary }}
              >
                View Stats
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell sx={{ color: theme.palette.text.primary }}>
                  {emp.id}
                </TableCell>
                <TableCell sx={{ color: theme.palette.text.primary }}>
                  {emp.name}
                </TableCell>
                <TableCell sx={{ color: theme.palette.text.primary }}>
                  {emp.role}
                </TableCell>
                <TableCell align="right">
                  <Button
                    variant="contained"
                    onClick={() =>
                      router.push(`/dashboard/supervisor/${emp.id}/userstat`)
                    }
                  >
                    Open
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  align="center"
                  sx={{ color: theme.palette.text.secondary }}
                >
                  No team members found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
