import React, { useState, useEffect } from "react";
import api from "../services/api";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { Snackbar, Alert } from "@mui/material";
import {
  sendRoleAssignedEmail,
  sendAccountDeletedEmail,
} from "../services/emailService";

const RoleUpdate = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editFullName, setEditFullName] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");

  // Fetch users from the database
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.getUsers(); // Fetch from your backend API
        setUsers(response);
        setFilteredUsers(response);
      } catch (error) {
        console.error("Error fetching users", error);
        setError("Failed to load users. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Search functionality for filtering users by name or email
  useEffect(() => {
    const results = users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(results);
  }, [searchTerm, users]);

  const handleUpdateRole = async (email) => {
    try {
      console.log("Updating role for:", email); // Log the email of the user
      const updatedUser = await api.updateUserRole(email, newRole); // Update role through the API
      if (updatedUser) {
        console.log("Role updated in the backend:", updatedUser); // Log the updated user

        // Update UI state
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.email === email ? { ...u, role: newRole } : u
          )
        );
        setNewRole("");
        setSelectedUser(null);

        // Send the role assigned email after updating the user's role
        console.log("Calling sendRoleAssignedEmail...");
        await sendRoleAssignedEmail(email, newRole);

        // Set alert state
        setAlertMessage(`Role updated to ${newRole} successfully.`);
        setAlertSeverity("success");
        setAlertOpen(true);
      }
    } catch (error) {
      console.error("Error updating role", error);
      setError("Failed to update role. Please try again.");
    }
  };

  const handleDeleteUser = async (email) => {
    const userToDelete = users.find((user) => user.email === email);

    if (userToDelete.role === "Admin") {
      setAlertMessage("Admin users cannot be deleted.");
      setAlertSeverity("error");
      setAlertOpen(true);
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${email}?`)) {
      try {
        await api.deleteUser(email); // Delete user through the API
        setUsers((prevUsers) =>
          prevUsers.filter((user) => user.email !== email)
        );

        // Send account deletion email
        await sendAccountDeletedEmail(email);

        setAlertMessage("User deleted successfully.");
        setAlertSeverity("success");
        setAlertOpen(true);
      } catch (error) {
        console.error("Error deleting user", error);
        setAlertMessage("Error deleting user.");
        setAlertSeverity("error");
        setAlertOpen(true);
      }
    }
  };

  const handleUpdateFullName = async (email) => {
    try {
      const updatedUser = await api.updateUserName(email, editFullName); // Update full name via API
      if (updatedUser) {
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.email === email ? { ...u, fullName: editFullName } : u
          )
        );
        setEditingUser(null);
        setEditFullName("");
        setAlertMessage("Name updated successfully.");
        setAlertSeverity("success");
        setAlertOpen(true);
      }
    } catch (error) {
      console.error("Error updating full name", error);
      setError("Failed to update full name. Please try again.");
    }
  };

  const handleCloseAlert = (event, reason) => {
    if (reason === "clickaway") return;
    setAlertOpen(false);
  };

  const getRoleClass = (role) => {
    switch (role) {
      case "Admin":
        return "text-green-400";
      case "Business Leader":
        return "text-blue-400";
      case "Marketing Analyst":
        return "text-yellow-300";
      case "Pending":
        return "text-red-500";
      default:
        return "bg-gray-100";
    }
  };

  if (loading) {
    return <div className="text-center text-xl">Loading...</div>;
  }

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium">User Management</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {error && (
        <div className="mb-4 text-red-600 bg-red-100 p-2 rounded">{error}</div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-[#1C1C1C]">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider rounded-l-md">
                #
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Full Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500 uppercase tracking-wider rounded-r-md">
                Options
              </th>
            </tr>
          </thead>
          <tbody className="bg-none divide-y divide-gray-200">
            {filteredUsers.map((user, index) => (
              <tr key={user.email} className="hover:bg-[#1C1C1C]">
                <td className="px-6 py-2 whitespace-nowrap text-base font-thin tracking-wide text-gray-100 border-b border-[#3F3F3F]">
                  {index + 1}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-base font-thin tracking-wide text-gray-100 border-b border-[#3F3F3F]">
                  {editingUser === user.email ? (
                    <input
                      type="text"
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      placeholder="Edit Full Name"
                      className="p-1 border border-gray-500 rounded w-full"
                    />
                  ) : (
                    user.fullName
                  )}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-base font-thin tracking-wide text-gray-100 border-b border-[#3F3F3F]">
                  {user.email}
                </td>
                <td
                  className={`px-6 py-2 whitespace-nowrap text-base font-thin tracking-wide border-b border-[#3F3F3F] ${getRoleClass(
                    user.role
                  )}`}
                >
                  {selectedUser === user.email ? (
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="p-1 border text-gray-100 border-gray-300 rounded w-full"
                    >
                      <option value="">Select Role</option>
                      <option value="Business Leader">Business Leader</option>
                      <option value="Marketing Analyst">
                        Marketing Analyst
                      </option>
                      <option value="Admin">Admin</option>
                      <option value="Pending">Pending</option>
                    </select>
                  ) : (
                    user.role
                  )}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm font-thin tracking-wide border-b border-[#3F3F3F]">
                  <div className="flex justify-end space-x-2">
                    {selectedUser === user.email ? (
                      <button
                        onClick={() => handleUpdateRole(user.email)}
                        disabled={!newRole}
                        className="px-3 py-1 text-base bg-blue-400 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        Update
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedUser(user.email)}
                        className="px-2 py-1 text-base text-purple-400 bg-[#1C1C1C] rounded hover:bg-purple-400 hover:bg-opacity-30"
                      >
                        <ReplayOutlinedIcon />
                      </button>
                    )}

                    {editingUser === user.email ? (
                      <button
                        onClick={() => handleUpdateFullName(user.email)}
                        disabled={!editFullName}
                        className="px-3 py-1 text-base bg-green-400 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingUser(user.email);
                          setEditFullName(user.fullName);
                        }}
                        className="px-2 py-1 text-base text-yellow-400 bg-[#1C1C1C] rounded hover:bg-yellow-400 hover:bg-opacity-30"
                      >
                        <EditOutlinedIcon className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteUser(user.email)}
                      className="px-2 py-1 text-base text-red-400 bg-[#1C1C1C] rounded hover:bg-red-400 hover:bg-opacity-30"
                    >
                      <DeleteOutlinedIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Snackbar for success alert */}
        <Snackbar
          open={alertOpen}
          autoHideDuration={5000}
          onClose={handleCloseAlert}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseAlert}
            severity={alertSeverity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {alertMessage}
          </Alert>
        </Snackbar>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center text-gray-500 mt-4">No users found</div>
      )}
    </div>
  );
};

export default RoleUpdate;
