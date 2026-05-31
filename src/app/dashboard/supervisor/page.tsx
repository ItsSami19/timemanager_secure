"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { de } from "date-fns/locale";

export default function TimeEntryDashboard() {
  const [date, setDate] = useState<Date | null>(new Date());
  const [arrival, setArrival] = useState<Date | null>(
    new Date(new Date().setHours(8, 0, 0))
  );
  const [departure, setDeparture] = useState<Date | null>(
    new Date(new Date().setHours(17, 0, 0))
  );
  const [break30, setBreak30] = useState(false);
  const [break45, setBreak45] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const handleSubmit = async () => {
    if (!date || !arrival || !departure) return;
    setSubmitting(true);
    try {
      await axios.post("/api/time-entry", {
        date: date.toISOString(),
        arrival: arrival.toISOString(),
        departure: departure.toISOString(),
        breakMinutes: break30 ? 30 : break45 ? 45 : 0,
      });
      await fetchEntries();
      handleCancel();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setDate(new Date());
    setArrival(new Date(new Date().setHours(8, 0, 0)));
    setDeparture(new Date(new Date().setHours(17, 0, 0)));
    setBreak30(false);
    setBreak45(false);
  };

  interface TimeEntry {
    id: string;
    date: string;
    start: string;
    end: string;
    break: number;
    status: string;
  }

  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);

  const fetchEntries = async () => {
    try {
      setLoadingEntries(true);
      const res = await axios.get("/api/time-entry");
      setEntries(res.data);
    } catch (error) {
      console.error("Failed to load timesheets:", error);
    } finally {
      setLoadingEntries(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        {/* Sidebar */}
        <Box
          sx={{
            width: 220,
            backgroundColor: (theme) => theme.palette.background.paper,
            p: 2,
            borderRight: "1px solid #ccc",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Supervisor Panel
          </Typography>
          <List>
            <ListItem component="a" href="/dashboard/supervisor/team-stats">
              <ListItemText primary="See Team Stats" />
            </ListItem>
            <ListItem component="a" href="/dashboard/supervisor/timerequest">
              <ListItemText primary="Time Requests" />
            </ListItem>
            <ListItem
              component="a"
              href="/dashboard/supervisor/supervisorviewvacationrequest"
            >
              <ListItemText primary="Vacation Requests" />
            </ListItem>
          </List>
        </Box>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, p: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Paper sx={{ p: 3, width: 400, boxShadow: 3 }}>
              <Typography variant="h6" gutterBottom>
                Enter Time
              </Typography>

              <DatePicker
                label="Date"
                value={date}
                onChange={setDate}
                minDate={oneMonthAgo}
                slotProps={{ textField: { fullWidth: true, sx: { mb: 2 } } }}
              />

              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TimePicker
                  label="Arrival"
                  value={arrival}
                  onChange={setArrival}
                  slotProps={{ textField: { sx: { mr: 1 } } }}
                />
                <TimePicker
                  label="Departure"
                  value={departure}
                  onChange={setDeparture}
                  slotProps={{ textField: { sx: { ml: 1 } } }}
                />
              </Box>

              <Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={break30}
                      onChange={() => {
                        setBreak30(!break30);
                        setBreak45(false);
                      }}
                    />
                  }
                  label="Break 30 min"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={break45}
                      onChange={() => {
                        setBreak45(!break45);
                        setBreak30(false);
                      }}
                    />
                  }
                  label="Break 45 min"
                />
              </Box>

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={submitting}
                  sx={{ mr: 1 }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  Submit
                </Button>
              </Box>
            </Paper>
          </Box>

          {/* Entries */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Your Entries
            </Typography>

            {loadingEntries ? (
              <Typography>Loading...</Typography>
            ) : (
              entries.map((entry) => (
                <Paper key={entry.id} sx={{ p: 2, mb: 1 }}>
                  <Typography>
                    Date: {new Date(entry.date).toLocaleDateString()}
                  </Typography>
                  <Typography>
                    Time: {new Date(entry.start).toLocaleTimeString()} –{" "}
                    {new Date(entry.end).toLocaleTimeString()}
                  </Typography>
                  <Typography>Break: {entry.break} min</Typography>
                  <Typography>Status: {entry.status}</Typography>
                </Paper>
              ))
            )}
          </Box>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}
