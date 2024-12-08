import React, { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

import { useAuth } from "./context/AuthContext";
import api from "../services/api";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.getUsers(); // Fetch users from API
        setUsers(response); // Directly set the users array
      } catch (error) {
        console.error("Error fetching users", error);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === "admin") {
      fetchUsers();
    } else {
      setLoading(false); // If user is not admin, set loading to false
    }
  }, [user]);

  const handleUpdateRole = async (email) => {
    try {
      const updatedUser = await api.updateUserRole(email, newRole); // Get updated user data

      if (updatedUser) {
        // Update the users list with the updated role for the specific user
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.email === email ? { ...u, role: updatedUser.role } : u
          )
        );
        setNewRole(""); // Reset the role dropdown
        setSelectedUser(null); // Deselect the user

        // Show an alert after successfull role updation
        alert(`The role has been successfull changed.`); // Use updatedUser.role
      }
    } catch (error) {
      console.error("Error updating role", error);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box display="flex">
      <Drawer
        sx={{
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <List>
          <ListItem button onClick={() => {}}>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button onClick={() => logout()}>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          User Management
        </Typography>
        <Typography variant="h6" gutterBottom>
          Update User Role
        </Typography>
        {users.length > 0 ? (
          users.map((user) => (
            <Box
              key={user.email}
              sx={{ display: "flex", alignItems: "center", mb: 2 }}
            >
              <Typography variant="body1" sx={{ flexGrow: 1 }}>
                {user.fullName} ({user.email})
              </Typography>
              {selectedUser === user.email ? (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <FormControl fullWidth sx={{ width: 200 }}>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      label="Role"
                    >
                      <MenuItem value="Business Leader">
                        Business Leader
                      </MenuItem>
                      <MenuItem value="Marketing Analyst">
                        Marketing Analyst
                      </MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    sx={{ ml: 2 }}
                    onClick={() => handleUpdateRole(user.email)}
                    disabled={!newRole}
                  >
                    Update
                  </Button>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  onClick={() => setSelectedUser(user.email)}
                  sx={{ ml: 2 }}
                >
                  Change Role
                </Button>
              )}
            </Box>
          ))
        ) : (
          <Typography>No users available</Typography>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
