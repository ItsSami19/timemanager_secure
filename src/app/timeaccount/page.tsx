'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TableContainer, Table, TableHead,
  TableRow, TableCell, TableBody, Paper, useTheme
} from '@mui/material';

interface VacationData {
  PENDING: number;
  APPROVED: number;
  MAX: number;
  REMAINING: number;
}

interface TimeAccountEntry {
  month: string;
  hours: number;
}

export default function Page() {
  const theme = useTheme();
  const [vacationData, setVacationData] = useState<VacationData | null>(null);
  const [timeAccountData, setTimeAccountData] = useState<TimeAccountEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/userstatistics'); // Passe diesen Pfad ggf. an
        if (!res.ok) throw new Error('Not authorized or error fetching data');

        const data = await res.json();

        setVacationData(data.vacation);
        const times: TimeAccountEntry[] = Object.entries(data.workHoursByMonth).map(
          ([month, hours]) => ({ month, hours: hours as number })
        );
        setTimeAccountData(times);
      } catch (err: any) {
        console.error(err);
        setError('Fehler beim Laden der Daten');
      }
    };

    fetchData();
  }, []);
  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!vacationData) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
        {/* Flex Time Account Table */}
        <Box sx={{ flex: '1 1 calc(50% - 16px)' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: theme.palette.text.primary }}>
            Flex Time Account
          </Typography>
          <TableContainer component={Paper} sx={{ boxShadow: 3, bgcolor: theme.palette.background.paper }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Month</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Hours Worked</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {timeAccountData.map((entry) => (
                  <TableRow key={entry.month}>
                    <TableCell>{entry.month}</TableCell>
                    <TableCell align="right">{entry.hours.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Vacation Days Table */}
        <Box sx={{ flex: '1 1 calc(50% - 16px)' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: theme.palette.text.primary }}>
            Vacation Days {new Date().getFullYear()}
          </Typography>
          <TableContainer component={Paper} sx={{ boxShadow: 3, bgcolor: theme.palette.background.paper }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Field</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Requested</TableCell>
                  <TableCell align="right">{vacationData.PENDING}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Approved</TableCell>
                  <TableCell align="right">{vacationData.APPROVED}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Vacation Days</TableCell>
                  <TableCell align="right">{vacationData.MAX}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Remaining</TableCell>
                  <TableCell align="right">{vacationData.REMAINING}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
}