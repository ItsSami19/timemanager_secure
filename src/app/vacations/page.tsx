"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
Box,
Paper,
Typography,
Table,
TableBody,
TableCell,
TableContainer,
TableHead,
TableRow,
useTheme,
} from "@mui/material";

type VacationStats = {
available: number;
requested: number;
approved: number;
taken: number;
};

export default function VacationPage() {
const theme = useTheme();
const [data, setData] = useState<VacationStats>({
available: 0,
requested: 0,
approved: 0,
taken: 0,
});

useEffect(() => {
axios
.get<VacationStats>("/api/vacation")
.then((res) => setData(res.data))
.catch((err) => console.error("Error fetching vacation data:", err));
}, []);

return (
<Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
<Paper
elevation={3}
sx={{
p: 4,
width: 400,
backgroundColor: theme.palette.background.paper,
}}
>
<Typography variant="h4" gutterBottom>
Vacation 2025
</Typography>
            
    
<TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>Category</strong>
            </TableCell>
            <TableCell align="right">
              <strong>Days</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Available</TableCell>
            <TableCell align="right">{data.available}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Requested</TableCell>
            <TableCell align="right">{data.requested}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Approved</TableCell>
            <TableCell align="right">{data.approved}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Taken</TableCell>
            <TableCell align="right">{data.taken}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  </Paper>
  </Box>
  );
} 