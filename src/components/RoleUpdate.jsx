import React, { useState, useEffect } from "react";
import api from "../services/api";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";

const RoleUpdate = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.getUsers();
        setUsers(response);
      } catch (error) {
        console.error("Error fetching users", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUpdateRole = async (email) => {
    try {
      const updatedUser = await api.updateUserRole(email, newRole);

      if (updatedUser) {
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.email === email ? { ...u, role: updatedUser.role } : u
          )
        );
        setNewRole("");
        setSelectedUser(null);
        alert(`The role has been successfully changed.`);
      }
    } catch (error) {
      console.error("Error updating role", error);
    }
  };

  if (loading) {
    return <div className="text-center text-xl">Loading...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      {users.length > 0 ? (
        users.map((user) => (
          <div
            key={user.email}
            className="flex items-center mb-4 border-b pb-2"
          >
            <span className="flex-grow">
              {user.fullName} ({user.email})
            </span>
            {selectedUser === user.email ? (
              <div className="flex items-center">
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="p-2 border border-gray-300 rounded mr-4"
                >
                  <option value="">Select Role</option>
                  <option value="Business Leader">Business Leader</option>
                  <option value="Marketing Analyst">Marketing Analyst</option>
                  <option value="pending">Pending</option>
                </select>
                <button
                  onClick={() => handleUpdateRole(user.email)}
                  disabled={!newRole}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSelectedUser(user.email)}
                className="px-4 py-2 text-purple-600 bg-purple-200 rounded hover:bg-purple-300"
              >
                Change Role <ReplayOutlinedIcon />
              </button>
            )}
          </div>
        ))
      ) : (
        <div>No users available</div>
      )}
    </div>
  );
};

export default RoleUpdate;
