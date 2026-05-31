// frontend mit axios

"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from "@mui/material";

import Grid from "@mui/material/GridLegacy"; // Grid version 2
export default function VacationPage() {
  const [vacationRequests, setVacationRequests] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  useEffect(() => {
    const fetchVacationData = async () => {
      try {
        const { data: vacationData } = await axios.get(
          "/api/supervisor/vacation"
        );
        setVacationRequests(vacationData.requests);

        const { data: memberData } = await axios.get(
          "/api/supervisor/team-members"
        );
        setTeamMembers(memberData.members);
      } catch (error) {
        console.error("Fehler beim Laden der Daten:", error);
      }
    };

    fetchVacationData();
  }, []);

  const calculateVacationStats = (memberId: string) => {
    let requested = 0;
    let approved = 0;
    let taken = 0;

    const memberRequests = vacationRequests.filter(
      (req) => req.workerId === memberId
    );

    memberRequests.forEach((req) => {
      const duration =
        (new Date(req.to).getTime() - new Date(req.from).getTime()) /
          (1000 * 3600 * 24) +
        1;

      if (req.status === "PENDING") {
        requested += duration;
      } else if (req.status === "APPROVED") {
        approved += duration;
      } else if (req.status === "TAKEN") {
        taken += duration;
      }
    });

    return {
      requested,
      approved,
      taken,
      available: 30 - approved,
      quota: 30,
    };
  };

  const updateRequestStatus = async (
    id: string,
    status: string,
    rejectionReason?: string
  ) => {
    try {
      const response = await axios.put(`/api/supervisor/vacation/${id}`, {
        status,
        rejectionReason,
      });

      if (response.status === 200) {
        const updated = response.data.updated;
        setVacationRequests((prev) =>
          prev.map((r) => (r.id === id ? updated : r))
        );
      }
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Anfrage:", error);
    }
  };

  return (
    <Box p={4}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            Vacation Requests
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <b>Worker</b>
                  </TableCell>
                  <TableCell>
                    <b>From/To</b>
                  </TableCell>
                  <TableCell align="right">
                    <b>Status</b>
                  </TableCell>
                  <TableCell align="right"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vacationRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No vacation requests
                    </TableCell>
                  </TableRow>
                ) : (
                  vacationRequests.map((req) => (
                    <TableRow
                      key={req.id}
                      style={{
                        backgroundColor:
                          req.status === "APPROVED"
                            ? "lightgreen"
                            : req.status === "REJECTED"
                            ? "lightcoral"
                            : undefined,
                      }}
                    >
                      <TableCell>{req.worker}</TableCell>
                      <TableCell>{`${req.from} - ${req.to}`}</TableCell>
                      <TableCell align="right">{req.status}</TableCell>
                      <TableCell align="right">
                        {req.status === "PENDING" && (
                          <>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              sx={{ mr: 1 }}
                              onClick={() =>
                                updateRequestStatus(req.id, "APPROVED")
                              }
                            >
                              Accept
                            </Button>
                            <Button
                              variant="contained"
                              color="error"
                              size="small"
                              onClick={() => {
                                const reason = prompt(
                                  "Please give a reason for rejection:"
                                );
                                if (reason !== null) {
                                  updateRequestStatus(
                                    req.id,
                                    "REJECTED",
                                    reason
                                  );
                                }
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            Team Vacation Stats
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <b>Team Member</b>
                  </TableCell>
                  <TableCell>
                    <b>Available</b>
                  </TableCell>
                  <TableCell>
                    <b>Requested</b>
                  </TableCell>
                  <TableCell>
                    <b>Approved</b>
                  </TableCell>
                  <TableCell>
                    <b>Taken</b>
                  </TableCell>
                  <TableCell>
                    <b>Quota</b>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teamMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No team members found
                    </TableCell>
                  </TableRow>
                ) : (
                  teamMembers.map((member) => {
                    const stats = calculateVacationStats(member.id);

                    return (
                      <TableRow key={member.id}>
                        <TableCell>{member.name}</TableCell>
                        <TableCell>{stats.available}</TableCell>
                        <TableCell>{stats.requested}</TableCell>
                        <TableCell>{stats.approved}</TableCell>
                        <TableCell>{stats.taken}</TableCell>
                        <TableCell>{stats.quota}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
}
