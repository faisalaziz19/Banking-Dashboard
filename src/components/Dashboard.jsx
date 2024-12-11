import React, { useState, useEffect } from "react";
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
        const response = await api.getUsers();
        setUsers(response);
      } catch (error) {
        console.error("Error fetching users", error);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === "admin") {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [user]);

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
    <>
      <div className="h-screen w-screen font-[Akshar] bg-[#0C0C0C]">
        <div className="h-full w-full flex flex-col backdrop-blur-[20px] p-4">
          {/* Top Bar */}
          <div className="flex justify-between items-center inset-0 bg-gradient-to-r from-[rgba(126,126,126,0.2)] to-[rgba(173,173,173,0.2)] backdrop-blur-[20px] p-4 mb-4 rounded-lg">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="flex items-center">
              <span className="mr-4">Good Morning, {user?.fullName}</span>
              <div className="w-10 h-10 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold">
                {user?.fullName?.[0]}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-grow">
            {/* Sidebar */}
            <div className="w-60 mr-4 inset-0 bg-gradient-to-r from-[rgba(126,126,126,0.2)] to-[rgba(173,173,173,0.2)] backdrop-blur-[20px] p-4 rounded-lg">
              <div className="mb-4 font-bold">Dashboard</div>
              {user?.role === "admin" && (
                <div className="mb-4 font-bold">User Roles</div>
              )}
              <div
                onClick={logout}
                className="cursor-pointer text-red-600 font-bold hover:underline"
              >
                Logout
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow p-4 bg-gradient-to-r from-[rgba(126,126,126,0.2)] to-[rgba(173,173,173,0.2)] rounded-lg">
              {user?.role === "admin" ? (
                <>
                  <h2 className="text-2xl font-bold mb-4">User Management</h2>
                  <h3 className="text-xl mb-4">Update User Role</h3>
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
                              <option value="Business Leader">
                                Business Leader
                              </option>
                              <option value="Marketing Analyst">
                                Marketing Analyst
                              </option>
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
                            className="px-4 py-2 bg-gray-200 border border-gray-300 rounded hover:bg-gray-300"
                          >
                            Change Role
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div>No users available</div>
                  )}
                </>
              ) : (
                <h2 className="text-2xl font-bold">
                  Welcome to your dashboard, {user?.fullName}
                </h2>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
