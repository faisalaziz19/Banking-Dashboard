import React from "react";
import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div>
      <h1>Welcome to the Landing Page</h1>
      <p>Click below to navigate to login or signup.</p>
      <Link to="/login">Login</Link> | <Link to="/signup">Signup</Link>
    </div>
  );
}

export default LandingPage;
