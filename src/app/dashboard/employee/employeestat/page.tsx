'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  useTheme,
  CircularProgress,
} from '@mui/material';
import { Person } from '@mui/icons-material';

const UserDashboard = () => {
  const theme = useTheme();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserIdAndEmployee = async () => {
      try {
        const sessionRes = await fetch('/api/session/user');
        if (!sessionRes.ok) throw new Error('Session konnte nicht geladen werden');
        const { userId } = await sessionRes.json();
        setUserId(userId);

        const employeeRes = await fetch(`/api/employee-stat/${userId}`);
        const employeeData = await employeeRes.json();
        setEmployee(employeeData);
      } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserIdAndEmployee();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (!employee) {
    return <Typography>Mitarbeiter nicht gefunden</Typography>;
  }

  const lastActiveDate = new Date(employee.lastActive).toLocaleString();

  return (
    <Box
      sx={{
        maxWidth: 1200,
        margin: 'auto',
        mt: 4,
        p: 3,
        borderRadius: 3,
        boxShadow: 4,
        bgcolor: theme.palette.background.paper,
        color: theme.palette.text.primary,
      }}
    >
      <Typography variant="h5" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <Person sx={{ mr: 1 }} /> User Statistik
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between' }}>
        <Field label="User ID" value={employee.id.toString()} />
        <Field label="Name" value={employee.name} />
        <Field label="Email" value={employee.email} />
        <Field label="Role" value={employee.role} />
        <Field label="Team" value={employee.team} />
        <Field label="Supervisor" value={employee.supervisor} />
        <Field label="Last Active" value={lastActiveDate} />
      </Box>
    </Box>
  );
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <Paper sx={{ p: 2, width: 'calc(33.33% - 16px)', boxSizing: 'border-box', borderRadius: 2, boxShadow: 3 }}>
    <Typography variant="subtitle2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h6" sx={{ fontWeight: 500 }}>
      {value}
    </Typography>
  </Paper>
);

export default UserDashboard;
