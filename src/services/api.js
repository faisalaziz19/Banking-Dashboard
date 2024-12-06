const BASE_URL = "http://127.0.0.1:5000/api"; // Replace with your actual backend URL

export const api = {
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

      // Check if response is not ok and handle the error
      if (!response.ok) {
        const errorData = await response.json(); // Parse the error response
        throw new Error(errorData.error || "Login failed");
      }

      // Return the successful response as JSON
      return await response.json();
    } catch (error) {
      // Pass the backend error message (or fallback) up to the caller
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
};
