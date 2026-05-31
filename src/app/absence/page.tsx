// src/app/absence/page.tsx
"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Typography,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
} from "@mui/material";
import axios from "axios";

type Absence = {
  id: string;
  startDate: string;
  endDate: string;
  type: "VACATION" | "SICKNESS" | "FLEXTIME";
  status: string;
  hours?: number;
};

export default function AbsencePage() {
  const [data, setData] = useState<{
    absences: Absence[];
    flexTime: number;
    vacationDays: number;
  }>({ absences: [], flexTime: 0, vacationDays: 0 });
  const router = useRouter();

  useEffect(() => {
    axios.get("/api/absence").then((res) => setData(res.data));
  }, []);

  const calcDisplay = (a: Absence) => {
    if (a.type === "FLEXTIME") return `${a.hours} h`;
    const ms = new Date(a.endDate).getTime() - new Date(a.startDate).getTime();
    return `${Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1} d`;
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Box display="flex" gap={4} mb={2}>
        <Typography>Remaining FlexTime: {data.flexTime} h</Typography>
        <Typography>Vacation Days Left: {data.vacationDays}</Typography>
      </Box>

      <Typography variant="h4" gutterBottom>
        My Absences
      </Typography>
      <Button
        variant="contained"
        onClick={() => router.push("/absence/newabsence")}
      >
        New Absence
      </Button>

      <Paper sx={{ mt: 2, overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Start</TableCell>
              <TableCell>End</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.absences.map((a) => (
              <TableRow key={a.id}>
                <TableCell>
                  {new Date(a.startDate).toLocaleDateString("de-DE")}
                </TableCell>
                <TableCell>
                  {new Date(a.endDate).toLocaleDateString("de-DE")}
                </TableCell>
                <TableCell>{calcDisplay(a)}</TableCell>
                <TableCell>{a.type}</TableCell>
                <TableCell>{a.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}
