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
import { useRouter } from "next/navigation"; // ✅ Navigation-Import

// ✅ Employee-Typ definieren
type Employee = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export default function EmployeeStatisticsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const theme = useTheme();
  const router = useRouter(); // ✅ useRouter initialisieren

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("/api/user-stat");

        if (!res.ok) {
          throw new Error(`API returned status ${res.status}`);
        }

        const data: Employee[] = await res.json();
        setEmployees(data);
      } catch (error) {
        console.error("Fehler beim Abrufen der Mitarbeiter:", error);
      }
    };

    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter(
    (employee) =>
      (employee.name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (employee.email?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  return (
    <Box sx={{ p: 4, bgcolor: theme.palette.background.default }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: theme.palette.text.primary }}
      >
        Employee Statistics
      </Typography>

      <TextField
        fullWidth
        placeholder="🔍 E-mail / Name"
        variant="outlined"
        sx={{
          mb: 3,
          input: {
            color: theme.palette.text.primary,
          },
          fieldset: {
            borderColor: theme.palette.text.primary,
          },
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
                See Statistics
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEmployees
              .filter((emp) => emp.role !== "HR")
              .map((emp) => (
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
                      color="success"
                      onClick={() =>
                        router.push(`/dashboard/hr/${emp.id}/hruserstat/`)
                      } // ✅ Korrekte Route // !!!route wichtig hier !!!!
                    >
                      Open Statistics
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            {filteredEmployees.filter((emp) => emp.role !== "HR").length ===
              0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  align="center"
                  sx={{ color: theme.palette.text.secondary }}
                >
                  No employees found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
