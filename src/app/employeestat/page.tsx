'use client';

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  useTheme,
} from '@mui/material';

const UserDashboard = () => {
  const theme = useTheme(); // Zugriff auf aktives Theme

  const employee = {
    name: 'Max Mustermann',
    email: 'max.mustermann@example.com',
    createdAt: '2022-01-15T12:00:00Z',
    projectsCompleted: 12,
    avgHoursPerWeek: 38,
    lastActive: '2025-04-28T09:30:00Z',
  };

  const joinDate = new Date(employee.createdAt);
  const daysAtCompany = Math.floor((Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
  const lastActiveDate = new Date(employee.lastActive).toLocaleString();

  return (
    <Box
      sx={{
        maxWidth: 700,
        margin: 'auto',
        mt: 4,
        p: 3,
        borderRadius: 3,
        boxShadow: 4,
        bgcolor: theme.palette.background.paper,
        color: theme.palette.text.primary,
      }}
    >
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        👤 Benutzerstatistik: {employee.name}
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flex: '1 1 calc(50% - 16px)' }}>
          <Paper elevation={1} sx={{ p: 2, borderRadius: 2, bgcolor: theme.palette.background.default }}>
            <Typography variant="subtitle2" color="text.secondary">
              Zugehörigkeit
            </Typography>
            <Typography variant="h6">{daysAtCompany} Tage</Typography>
          </Paper>
        </Box>

        <Box sx={{ flex: '1 1 calc(50% - 16px)' }}>
          <Paper elevation={1} sx={{ p: 2, borderRadius: 2, bgcolor: theme.palette.background.default }}>
            <Typography variant="subtitle2" color="text.secondary">
              Projekte abgeschlossen
            </Typography>
            <Typography variant="h6">{employee.projectsCompleted}</Typography>
          </Paper>
        </Box>

        <Box sx={{ flex: '1 1 calc(50% - 16px)' }}>
          <Paper elevation={1} sx={{ p: 2, borderRadius: 2, bgcolor: theme.palette.background.default }}>
            <Typography variant="subtitle2" color="text.secondary">
              Ø Stunden pro Woche
            </Typography>
            <Typography variant="h6">{employee.avgHoursPerWeek}</Typography>
          </Paper>
        </Box>

        <Box sx={{ flex: '1 1 calc(50% - 16px)' }}>
          <Paper elevation={1} sx={{ p: 2, borderRadius: 2, bgcolor: theme.palette.background.default }}>
            <Typography variant="subtitle2" color="text.secondary">
              Letzte Aktivität
            </Typography>
            <Typography variant="h6">{lastActiveDate}</Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default UserDashboard;


/*http://localhost:3000/dashboard/employee/[id]/employeestat*/
