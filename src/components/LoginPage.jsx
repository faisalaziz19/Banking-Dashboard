import React, { useState } from "react";

function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login Form Submitted", formData);
    // Add your login logic here
  };

  return (
    <div className="flex items-center justify-center font-[Akshar] w-screen h-screen bg-gradient-to-b from-purple-600 to-purple-900">
      <form
        className="inset-0 bg-gradient-to-tr from-[rgba(0,0,0,0.2)] via-transparent to-[rgba(244,244,244,0.2)] shadow-[5px_5px_10px_2px_rgba(0,0,0,0.25)] rounded-[20px] p-8"
        style={{ width: "350px" }}
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl font-medium text-left text-white mb-6">
          Sign in to your account
        </h2>
        <div className="mb-4">
          <label className="block text-white mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full p-2 border rounded bg-transparent"
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
            className="w-full p-2 border rounded bg-transparent"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-blue-500 text-white rounded-lg"
        >
          Sign in
        </button>
        <p className="text-center text-white mt-4">
          New here?{" "}
          <a href="/signup" className="text-blue-500 hover:underline">
            Create an account.
          </a>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
