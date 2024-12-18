import React, { useState, useEffect } from "react";
import api from "../services/api";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

const RoleUpdate = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // Error handling
  const [editFullName, setEditFullName] = useState(""); // For full name edit
  const [editingUser, setEditingUser] = useState(null); // Tracks user being edited

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.getUsers();
        setUsers(response);
      } catch (error) {
        console.error("Error fetching users", error);
        setError("Failed to load users. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Update Role
  const handleUpdateRole = async (email) => {
    try {
      const updatedUser = await api.updateUserRole(email, newRole);
      if (updatedUser) {
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.email === email ? { ...u, role: newRole } : u
          )
        );
        setNewRole("");
        setSelectedUser(null);
        alert(`Role updated successfully to ${newRole}.`);
      }
    } catch (error) {
      console.error("Error updating role", error);
      setError("Failed to update role. Please try again.");
    }
  };

  const handleDeleteUser = async (email) => {
    if (window.confirm(`Are you sure you want to delete ${email}?`)) {
      try {
        await api.deleteUser(email);
        setUsers((prevUsers) =>
          prevUsers.filter((user) => user.email !== email)
        );
        alert("User deleted successfully.");
      } catch (error) {
        console.error("Error deleting user", error);
        setError("Sorry, can't delete an Admin User.");

        // Clearing out the error message after a while
        setTimeout(() => {
          setError("");
        }, 2500);
      }
    }
  };

  // Update Full Name
  const handleUpdateFullName = async (email) => {
    try {
      const updatedUser = await api.updateUserName(email, editFullName);
      if (updatedUser) {
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.email === email ? { ...u, fullName: editFullName } : u
          )
        );
        setEditingUser(null);
        setEditFullName("");
        alert("Full name updated successfully.");
      }
    } catch (error) {
      console.error("Error updating full name", error);
      setError("Failed to update full name. Please try again.");
    }
  };

  if (loading) {
    return <div className="text-center text-xl">Loading...</div>;
  }

  return (
    <div className="p-2">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>

      {error && (
        <div className="mb-4 text-red-600 bg-red-100 p-2 rounded">{error}</div>
      )}

      {users.length > 0 ? (
        users.map((user) => (
          <div
            key={user.email}
            className="flex items-center mb-4 border-b pb-2"
          >
            <span className="flex-grow">
              {editingUser === user.email ? (
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  placeholder="Edit Full Name"
                  className="p-1 border border-gray-300 rounded mr-2"
                />
              ) : (
                <>
                  {user.fullName} | {user.email} {" | "}
                  <span className="text-gray-400 font-extralight">
                    {user.role}
                  </span>
                </>
              )}
            </span>

            {/* Update Role */}
            {selectedUser === user.email ? (
              <div className="flex items-center">
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="p-2 border border-gray-300 rounded mr-2"
                >
                  <option value="">Select Role</option>
                  <option value="Business Leader">Business Leader</option>
                  <option value="Marketing Analyst">Marketing Analyst</option>
                  <option value="Admin">Admin</option>
                  <option value="Pending">Pending</option>
                </select>
                <button
                  onClick={() => handleUpdateRole(user.email)}
                  disabled={!newRole}
                  className="px-3 py-1 cursor-pointer bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
                >
                  Update
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSelectedUser(user.email)}
                className="px-3 py-1 text-purple-600 bg-purple-200 rounded hover:bg-purple-300 mr-2"
              >
                Change Role <ReplayOutlinedIcon />
              </button>
            )}

            {/* Edit Full Name */}
            {editingUser === user.email ? (
              <button
                onClick={() => handleUpdateFullName(user.email)}
                disabled={!editFullName}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
              >
                Save
              </button>
            ) : (
              <button
                onClick={() => {
                  setEditingUser(user.email);
                  setEditFullName(user.fullName);
                }}
                className="px-3 py-1 text-yellow-600 bg-yellow-200 rounded hover:bg-yellow-300 mr-2"
              >
                Edit <EditOutlinedIcon />
              </button>
            )}

            {/* Delete User */}
            <button
              onClick={() => handleDeleteUser(user.email)}
              className="px-3 py-1 text-red-600 bg-red-200 rounded hover:bg-red-300"
            >
              Delete <DeleteOutlinedIcon />
            </button>
          </div>
        ))
      ) : (
        <div>No users available</div>
      )}
    </div>
  );
};

export default RoleUpdate;
