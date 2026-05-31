"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Typography,
  Container,
  Box,
  Paper,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";

export default function HRSicknessRequest() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [untilDate, setUntilDate] = useState<Date | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get("/api/hr/sickness");
        setEmployees(res.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  const handleSubmit = async () => {
    if (!fromDate || !untilDate || !selectedEmployee) {
      console.error("Missing required fields");
      return;
    }

    try {
      await axios.post("/api/hr/sickness", {
        from: fromDate?.toISOString(),
        until: untilDate?.toISOString(),
        targetUserId: selectedEmployee,
      });
      setSnackbarMessage("Sick leave successfully submitted!");
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Error submitting sickness:", error);
      setSnackbarMessage("Failed to submit sick leave.");
      setOpenSnackbar(true);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container sx={{ mt: 4 }}>
        <Box maxWidth="sm">
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Enter Sick Leave
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Employee</InputLabel>
              <Select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                label="Employee"
              >
                {employees.length > 0 ? (
                  employees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {employee.name} ({employee.role})
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="">No Employees</MenuItem>
                )}
              </Select>
            </FormControl>
            <DatePicker
              label="From"
              value={fromDate}
              onChange={(newValue) => setFromDate(newValue)}
              slotProps={{ textField: { fullWidth: true, sx: { mb: 2 } } }}
            />
            <DatePicker
              label="Until"
              value={untilDate}
              onChange={(newValue) => setUntilDate(newValue)}
              slotProps={{ textField: { fullWidth: true, sx: { mb: 2 } } }}
            />
            <Box display="flex" justifyContent="space-between">
              <Button variant="outlined">Cancel</Button>
              <Button variant="contained" color="primary" onClick={handleSubmit}>
                Send
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>

      {/* confirmation pop-up */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );
}
