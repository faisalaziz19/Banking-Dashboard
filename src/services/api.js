import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000/api"; // Ensure this matches your backend URL

const api = {
  // Login method
  login: async (credentials) => {
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || "Network error occurred");
    }
  },

  // Signup method
  signup: async (userData) => {
    try {
      const response = await fetch(`${BASE_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Signup failed");
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || "Network error occurred");
    }
  },

  // Method to validate token
  validateToken: async (token) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/validate`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  },

  // Get all users for the admin dashboard
  getUsers: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/users`);
      return response.data; // Response is assumed to be an array of user objects
    } catch (error) {
      console.error(
        "Error fetching users:",
        error.response?.data || error.message
      );
      throw new Error("Failed to fetch users");
    }
  },

  // Update the role of a user
  updateUserRole: async (email, role) => {
    try {
      const response = await axios.put(`${BASE_URL}/users/${email}/role`, {
        role,
      });

      if (response && response.data && response.data.message) {
        return response.data;
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      console.error(
        "Error updating user role:",
        error.response?.data || error.message
      );
      throw new Error("Failed to update role");
    }
  },

  // Delete a user by email
  deleteUser: async (email) => {
    try {
      const response = await axios.delete(`${BASE_URL}/users/${email}`);
      return response.data;
    } catch (error) {
      console.error(
        "Error deleting user:",
        error.response?.data || error.message
      );
      throw new Error("Failed to delete user");
    }
  },

  // Update a user's full name
  updateUserName: async (email, fullName) => {
    try {
      const response = await axios.put(`${BASE_URL}/users/${email}/name`, {
        fullName,
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error updating user name:",
        error.response?.data || error.message
      );
      throw new Error("Failed to update user name");
    }
  },
};

export default api;
