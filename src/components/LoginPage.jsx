import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import api from "../services/api.js";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.login(formData);
      login(response.user, response.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center font-[Akshar] w-screen h-screen bg-custom-gradient">
      <div className="glass-bg-behind-form absolute w-full h-full flex items-center justify-center bg-white/5 backdrop-blur-[20px]">
        <form
          className="inset-0 bg-gradient-to-tr from-[rgba(0,0,0,0.2)] via-transparent to-[rgba(244,244,244,0.2)] shadow-[5px_5px_10px_2px_rgba(0,0,0,0.25)] rounded-[20px] p-8"
          style={{ width: "350px" }}
          onSubmit={handleSubmit}
        >
          <h2 className="text-xl font-medium text-left text-white mb-6">
            Sign in to your account
          </h2>
          {error && (
            <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
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
            {loading ? "Signing in..." : "Sign in"}
          </button>
          <p className="text-center text-white mt-4">
            New here?{" "}
            <a href="/signup" className="text-blue-500 hover:underline">
              Create an account.
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
