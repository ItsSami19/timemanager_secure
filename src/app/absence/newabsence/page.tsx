/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { de } from "date-fns/locale";

export default function NewAbsencePage() {
  const router = useRouter();
  const [type, setType] = useState<"" | "VACATION" | "FLEXTIME">("");
  const [from, setFrom] = useState<Date | null>(null);
  const [until, setUntil] = useState<Date | null>(null);

  const handleSubmit = async () => {
    const body: any = { type };
    if (type === "FLEXTIME") {
      if (!from) return;
      body.date = from.toISOString();
      body.hours = 8;
    } else {
      if (!from || !until) return;
      body.from = from.toISOString();
      body.until = until.toISOString();
    }

    const res = await fetch("/api/absence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      router.push("/absence");
    } else {
      alert("Absence konnte nicht übermittelt werden.");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
      <Box maxWidth="sm" mx="auto" p={4}>
        <Typography variant="h4" gutterBottom>
          New Absence
        </Typography>

        <Box
          bgcolor="white"
          p={4}
          borderRadius={3}
          boxShadow={3}
          display="flex"
          flexDirection="column"
          gap={3}
        >
          <FormControl fullWidth>
            <InputLabel>Kind of Absence</InputLabel>
            <Select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              label="Kind of Absence"
            >
              <MenuItem value="">Choose…</MenuItem>
              <MenuItem value="VACATION">Vacation</MenuItem>
              <MenuItem value="FLEXTIME">FlexTime (8 h)</MenuItem>
            </Select>
          </FormControl>

          {type === "FLEXTIME" ? (
            <DatePicker
              label="Date"
              value={from}
              onChange={(d) => setFrom(d)}
              format="dd.MM.yyyy"
              slotProps={{ textField: { fullWidth: true } }}
            />
          ) : (
            <Box display="flex" gap={2}>
              <DatePicker
                label="From"
                value={from}
                onChange={(d) => setFrom(d)}
                format="dd.MM.yyyy"
                slotProps={{ textField: { fullWidth: true } }}
              />
              <DatePicker
                label="To"
                value={until}
                onChange={(d) => setUntil(d)}
                format="dd.MM.yyyy"
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Box>
          )}

          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="outlined" onClick={() => router.push("/absence")}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={
                !type || (type === "FLEXTIME" ? !from : !from || !until)
              }
            >
              Send
            </Button>
          </Box>
        </Box>
      </Box>
    </LocalizationProvider>
  );
}
