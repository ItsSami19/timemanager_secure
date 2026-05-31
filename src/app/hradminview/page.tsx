"use client";

import { useEffect, useState } from "react";
import {
  Button, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, MenuItem, Select, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControl, InputLabel, Autocomplete, Chip,
  CircularProgress, Alert, Snackbar
} from "@mui/material";
import axios from "axios";

type User = {
  id: string;
  name: string;
  email: string;
  teamId: string | null;
  team: {
    id: string;
    name: string;
  } | null;
  role: string;
};

type Team = {
  id: string;
  name: string;
  supervisorId: string;
};

const roleHierarchy = ['EMPLOYEE', 'SUPERVISOR', 'HR'];

export default function HRAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [open, setOpen] = useState(false);
  const [openTeamDialog, setOpenTeamDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    name: "",
    team: "",
    role: "EMPLOYEE",
    password: "",
    isNewTeam: false,
    supervisorId: "",
    employeeIds: [] as string[]
  });
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamSupervisor, setNewTeamSupervisor] = useState("");
  const [newTeamMembers, setNewTeamMembers] = useState<string[]>([]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/hradmin/users");
      setUsers(res.data);
    } catch (error) {
      setError("Failed to fetch users");
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await axios.get("/api/hradmin/teams");
      setTeams(res.data);
    } catch (error) {
      setError("Failed to fetch teams");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTeams();
  }, []);

  const handleCreate = async () => {
    try {
      setLoading(true);
      if (form.team === "__new__") {
        if (!form.supervisorId) {
          setError("Please select a supervisor for the new team");
          return;
        }
        if (!newTeamName) {
          setError("Please enter a team name");
          return;
        }
      }
      const createData = {
        email: form.email,
        name: form.name,
        team: form.team === "__new__" ? newTeamName : form.team,
        role: form.role,
        password: form.password,
        isNewTeam: form.team === "__new__",
        supervisorId: form.supervisorId,
        employeeIds: form.employeeIds
      };
      await axios.post("/api/hradmin/create", createData);
      setForm({
        email: "",
        name: "",
        team: "",
        role: "EMPLOYEE",
        password: "",
        isNewTeam: false,
        supervisorId: "",
        employeeIds: []
      });
      setNewTeamName("");
      setOpen(false);
      await fetchUsers();
      await fetchTeams();
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    try {
      setLoading(true);
      if (!newTeamName) {
        setError("Please enter a team name");
        return;
      }
      if (!newTeamSupervisor) {
        setError("Please select a supervisor");
        return;
      }

      // Create the team
      const teamResponse = await axios.post("/api/hradmin/create", {
        team: newTeamName,
        isNewTeam: true,
        supervisorId: newTeamSupervisor,
        employeeIds: newTeamMembers
      });

      // Update the teams list
      await fetchTeams();
      
      // If there are team members, update their team assignments
      if (newTeamMembers.length > 0) {
        const teamId = teamResponse.data.id;
        if (teamId) {
          await Promise.all(newTeamMembers.map(memberId =>
            axios.post("/api/hradmin/update", {
              id: memberId,
              teamId: teamId
            })
          ));
        }
      }

      setNewTeamName("");
      setNewTeamSupervisor("");
      setNewTeamMembers([]);
      setOpenTeamDialog(false);
      await fetchUsers();
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  const updateRole = (currentRole: string, action: 'promote' | 'demote') => {
    const currentIndex = roleHierarchy.indexOf(currentRole);
    if (action === 'promote') {
      return roleHierarchy[Math.min(currentIndex + 1, roleHierarchy.length - 1)];
    }
    return roleHierarchy[Math.max(currentIndex - 1, 0)];
  };

  const handleRoleChange = async (id: string, action: 'promote' | 'demote') => {
    try {
      setLoading(true);
      const user = users.find(u => u.id === id);
      if (!user) return;
      const newRole = updateRole(user.role, action);
      await axios.post("/api/hradmin/update", { id, role: newRole });
      await fetchUsers();
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to update role");
    } finally {
      setLoading(false);
    }
  };

  const handleTeamChange = async (userId: string, teamId: string | null) => {
    try {
      setLoading(true);
      const response = await axios.post("/api/hradmin/update", {
        id: userId,
        teamId: teamId || null
      });
      const updatedUser = response.data;
      setUsers(users.map(user =>
        user.id === userId ? {
          ...user,
          teamId: updatedUser.teamId,
          team: updatedUser.team
        } : user
      ));
      // Refresh teams to ensure all data is up to date
      await fetchTeams();
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to update team");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await axios.post("/api/hradmin/delete", { id });
      await fetchUsers();
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  const availableSupervisors = users.filter(user => user.role === 'SUPERVISOR');
  const availableEmployees = users.filter(user => user.role === 'EMPLOYEE' && !user.teamId);

  return (
    <div style={{ padding: 20 }}>
      <h1>User Administration</h1>
      <Button variant="contained" onClick={() => setOpen(true)}>+ Create User</Button>
      <Button variant="outlined" style={{ marginLeft: 12 }} onClick={() => setOpenTeamDialog(true)}>+ Create Team</Button>

      {/* Create Team Dialog */}
      <Dialog open={openTeamDialog} onClose={() => setOpenTeamDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Team</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Team Name</InputLabel>
            <TextField
              value={newTeamName}
              onChange={e => setNewTeamName(e.target.value)}
              fullWidth
              margin="dense"
              placeholder="Enter team name"
            />
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Supervisor</InputLabel>
            <Select
              value={newTeamSupervisor}
              onChange={e => setNewTeamSupervisor(e.target.value)}
              label="Supervisor"
            >
              {availableSupervisors.map((supervisor) => (
                <MenuItem key={supervisor.id} value={supervisor.id}>
                  {supervisor.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Autocomplete
            multiple
            options={availableEmployees}
            getOptionLabel={(option) => option.name}
            value={users.filter(user => newTeamMembers.includes(user.id))}
            onChange={(_, newValue) => {
              setNewTeamMembers(newValue.map(user => user.id));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Team Members"
                margin="dense"
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...chipProps } = getTagProps({ index });
                return (
                  <Chip
                    key={key}
                    label={option.name}
                    {...chipProps}
                  />
                );
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTeamDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateTeam} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Create Team"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create User</DialogTitle>
        <DialogContent>
          <TextField label="Email" fullWidth margin="dense" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <TextField label="Name" fullWidth margin="dense" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <TextField label="Password" fullWidth margin="dense" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          <FormControl fullWidth margin="dense">
            <InputLabel>Role</InputLabel>
            <Select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} label="Role">
              <MenuItem value="EMPLOYEE">Employee</MenuItem>
              <MenuItem value="SUPERVISOR">Supervisor</MenuItem>
              <MenuItem value="HR">HR</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Team</InputLabel>
            <Select
              value={form.team}
              onChange={e => {
                setForm({ ...form, team: e.target.value, supervisorId: "", employeeIds: [] });
                if (e.target.value !== "__new__") setNewTeamName("");
              }}
              label="Team"
            >
              <MenuItem value="">
                <em>Select a team</em>
              </MenuItem>
              {teams.map((team) => (
                <MenuItem key={team.id} value={team.name}>
                  {team.name}
                </MenuItem>
              ))}
              <MenuItem value="__new__">+ Create New Team</MenuItem>
            </Select>
          </FormControl>
          {form.team === "__new__" && (
            <>
              <FormControl fullWidth margin="dense">
                <InputLabel shrink>New Team Name</InputLabel>
                <TextField
                  value={newTeamName}
                  onChange={e => setNewTeamName(e.target.value)}
                  fullWidth
                  margin="dense"
                  placeholder="Enter new team name"
                />
              </FormControl>
              <FormControl fullWidth margin="dense">
                <InputLabel>Team Supervisor</InputLabel>
                <Select
                  value={form.supervisorId}
                  onChange={e => setForm({ ...form, supervisorId: e.target.value })}
                  label="Team Supervisor"
                >
                  {availableSupervisors.map((supervisor) => (
                    <MenuItem key={supervisor.id} value={supervisor.id}>
                      {supervisor.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Autocomplete
                multiple
                options={availableEmployees}
                getOptionLabel={(option) => option.name}
                value={users.filter(user => form.employeeIds.includes(user.id))}
                onChange={(_, newValue) => {
                  setForm({
                    ...form,
                    employeeIds: newValue.map(user => user.id)
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Team Members"
                    margin="dense"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...chipProps } = getTagProps({ index });
                    return (
                      <Chip
                        key={key}
                        label={option.name}
                        {...chipProps}
                      />
                    );
                  })
                }
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <Table style={{ marginTop: 20 }}>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Team</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map(u => (
            <TableRow key={u.id}>
              <TableCell>{u.name}</TableCell>
              <TableCell>
                <FormControl fullWidth size="small">
                  <Select
                    value={u.teamId || ""}
                    onChange={(e) => handleTeamChange(u.id, e.target.value || null)}
                    displayEmpty
                    disabled={loading}
                  >
                    <MenuItem value="">
                      <em>No Team</em>
                    </MenuItem>
                    {teams.map((team) => (
                      <MenuItem 
                        key={team.id} 
                        value={team.id}
                        disabled={u.role === 'SUPERVISOR' && team.supervisorId !== u.id}
                      >
                        {team.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </TableCell>
              <TableCell>{u.role}</TableCell>
              <TableCell>
                <Button 
                  variant="contained" 
                  color="success" 
                  onClick={() => handleRoleChange(u.id, "promote")}
                  disabled={u.role === 'HR' || loading}
                >
                  Promote
                </Button>
                <Button 
                  variant="contained" 
                  color="warning" 
                  onClick={() => handleRoleChange(u.id, "demote")} 
                  style={{ marginLeft: 8 }}
                  disabled={u.role === 'EMPLOYEE' || loading}
                >
                  Demote
                </Button>
                <Button 
                  variant="contained" 
                  color="error" 
                  onClick={() => handleDelete(u.id)} 
                  style={{ marginLeft: 8 }}
                  disabled={loading}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
}
