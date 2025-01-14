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

  // Get users based on role, defaulting to all users if no role is provided
  getUsers: async (role = null) => {
    try {
      // Construct the URL with query parameter for role if provided
      const url = role ? `${BASE_URL}/users?role=${role}` : `${BASE_URL}/users`;

      const response = await axios.get(url);
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

  getChartsForUser: async (role) => {
    try {
      const response = await fetch(`${BASE_URL}/get-charts?role=${role}`);
      if (!response.ok) {
        throw new Error("Failed to fetch charts");
      }
      const charts = await response.json();
      return charts;
    } catch (error) {
      console.error("Error fetching charts:", error);
      return [];
    }
  },

  getTransactionData: async (year) => {
    try {
      const response = await fetch(
        `${BASE_URL}/get-transaction-data?year=${year}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch transaction data");
      }
      const data = await response.json();
      return data; // Return the data in the desired format
    } catch (error) {
      console.error("Error fetching transaction data:", error);
      return []; // Return an empty array or some default value if error occurs
    }
  },

  getLoanData: async (year) => {
    try {
      const response = await fetch(`${BASE_URL}/get-loan-data?year=${year}`);
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error) {
          throw new Error(errorData.error); // Throw the error message from the backend
        }
      }
      const data = await response.json();
      return data; // Return the data in the desired format
    } catch (error) {
      console.error("Error fetching loan data:", error);
      return { error: error.message }; // Return error message to be displayed to the user
    }
  },
};

export default api;
