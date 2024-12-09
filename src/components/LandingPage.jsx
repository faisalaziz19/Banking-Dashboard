import React from "react";
import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="justify-center font-[Akshar] h-screen w-screen items-center bg-custom-gradient">
      <div className="flex justify-center items-center glass-bg-behind-form absolute w-full h-full bg-white/5 backdrop-blur-[20px]">
        <div className="herosection ml-10 mr-10">
          <h1 className="font-bold text-[48px] sm:text-[60px] md:text-[80px] lg:text-[100px] text-white">
            Landing Page of the <br /> Banking Dashboard.
          </h1>
          <div className="buttons flex flex-row items-center justify-center mt-5">
            <Link
              className="px-4 py-2 border mr-3 border-white bg-white/10 text-white rounded-[10px] hover:bg-white/20"
              to="/login"
            >
              Login
            </Link>
            <Link
              className="px-4 py-2 border border-white bg-white/10 text-white rounded-[10px] hover:bg-white/20"
              to="/signup"
            >
              Signup
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
