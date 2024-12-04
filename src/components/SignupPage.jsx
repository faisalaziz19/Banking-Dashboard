import React from "react";
import { Link } from "react-router-dom";

function SignupPage() {
  return (
    <div>
      <h1>Signup Page</h1>
      <p>Create an account to get started.</p>
      {/* Add your signup form here */}
      <Link to="/login">Already have an account? Login</Link>
    </div>
  );
}

export default SignupPage;
