"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Paper,
  useTheme,
} from "@mui/material";

type Request = {
  id: string;
  date: string;
  start: string;
  end: string;
  break: number;
  user: { id: string; name: string };
};

export default function TimeRequestsPage() {
  const theme = useTheme();
  const [requests, setRequests] = useState<Request[]>([]);

  const fetchRequests = async () => {
    const res = await axios.get<Request[]>("/api/team-timesheets");
    setRequests(res.data);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: string, action: "APPROVED" | "REJECTED") => {
    await axios.patch(`/api/team-timesheets/${id}`, { action });
    fetchRequests();
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: theme.palette.text.primary }}
      >
        Pending Time Requests
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Break (min)</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.user.name}</TableCell>
                <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  {new Date(r.start).toLocaleTimeString()} –{" "}
                  {new Date(r.end).toLocaleTimeString()}
                </TableCell>
                <TableCell>{r.break}</TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    variant="contained"
                    sx={{ mr: 1 }}
                    onClick={() => handleAction(r.id, "APPROVED")}
                  >
                    Approve
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => handleAction(r.id, "REJECTED")}
                  >
                    Decline
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {requests.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  align="center"
                  sx={{ color: theme.palette.text.secondary }}
                >
                  No pending requests
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
