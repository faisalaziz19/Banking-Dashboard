import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000/api"; // Replace with your actual backend URL

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
        throw new Error(error.message || "Signup failed");
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || "Network error occurred");
    }
  },

  // Method to check if token is valid
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
      if (Array.isArray(response.data)) {
        return response.data; // Return the array directly if the response is an array
      } else {
        console.error("Unexpected data format:", response);
        throw new Error("Failed to fetch users: Unexpected data format");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error; // Throw error if the request fails
    }
  },

  // Update the role of a user
  updateUserRole: async (email, role) => {
    try {
      const response = await axios.put(`${BASE_URL}/users/${email}/role`, {
        role,
      });

      // Make sure to check the structure of the response
      if (response && response.data && response.data.message) {
        console.log("Role updated:", response.data.message); // Log the message or handle accordingly
        return response.data; // You can return the response or data based on your needs
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      throw new Error("Failed to update role: " + error.message); // Enhanced error message
    }
  },
};

export default api;
