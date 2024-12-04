import React from "react";
import { Link } from "react-router-dom";

function LoginPage() {
  return (
    <div>
      <h1>Login Page</h1>
      <p>Enter your credentials to login.</p>
      {/* Add your login form here */}
      <Link to="/signup">Don't have an account? Signup</Link>
    </div>
  );
}

export default LoginPage;
