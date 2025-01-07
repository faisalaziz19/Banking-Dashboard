import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  sendWelcomeEmail,
  notifyAdminsNewUser,
} from "../services/emailService";

function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (formData.password.length < 5) {
      setError("Password must be at least 5 characters long");
      setLoading(false);
      return;
    }

    try {
      // Perform signup
      await api.signup(formData);
      setSuccess("Registration successful! Please wait for admin approval.");

      // Fetch the list of admin emails
      const users = await api.getUsers();
      console.log("Fetched users:", users); // Add this line to log users
      const adminEmails = users
        .filter((user) => user.role === "Admin")
        .map((user) => user.email);
      console.log("Admin emails:", adminEmails); // Log the admin emails

      // Send email to new user
      await sendWelcomeEmail(formData.email);

      // Notify admins about the new user
      if (adminEmails.length > 0) {
        await notifyAdminsNewUser(adminEmails, {
          fullName: formData.fullName,
          email: formData.email,
        });
      } else {
        console.warn("No admin emails found.");
      }

      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center relative font-[Akshar] w-screen h-screen bg-custom-gradient">
      <div className="glass-bg-behind-form absolute w-full h-full flex items-center justify-center bg-white/5 backdrop-blur-[20px]">
        <form
          className="inset-0 bg-gradient-to-tr from-[rgba(0,0,0,0.2)] via-transparent to-[rgba(244,244,244,0.2)] shadow-[5px_5px_10px_2px_rgba(0,0,0,0.25)] rounded-[20px] p-8"
          style={{ width: "350px" }}
          onSubmit={handleSubmit}
        >
          <h2 className="text-xl font-medium text-left text-white mb-6">
            Create your account
          </h2>
          {error && (
            <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-2 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
            </div>
          )}
          <div className="mb-4">
            <label className="block text-white mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full p-2 border rounded bg-transparent text-white"
              placeholder="abc@ltimindtree.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2" htmlFor="fullName">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              className="w-full p-2 border rounded bg-transparent text-white"
              placeholder="Rachel Green"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-white mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full p-2 border rounded bg-transparent text-white"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
          <p className="text-center text-white mt-4">
            Already have an account?{" "}
            <a href="/login" className="text-blue-500 hover:underline">
              Sign in.
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignupPage;
