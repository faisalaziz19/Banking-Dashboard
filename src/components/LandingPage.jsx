import React from "react";
import { Link } from "react-router-dom";
import { InteractiveHoverButton } from "./InteractiveHoverButton";

function LandingPage() {
  return (
    <div
      className="min-h-screen font-[Akshar]"
      style={{
        backgroundImage: "url(src/assets/landingPageBg.png)",
        backgroundSize: "cover",
      }}
    >
      {/* Navigation */}
      <nav className="fixed w-full mt-4 z-10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl text-white font-bold">
                  Bank of LTIM
                </span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                <button className="text-lg text-white hover:text-gray-300">
                  Features
                </button>
                <button className="text-lg text-white hover:text-gray-300">
                  Team
                </button>
                <Link
                  className="px-6 py-2 border mr-3 text-lg text-white border-white rounded-2xl hover:bg-white hover:text-black"
                  to="/login"
                >
                  Login
                </Link>
                <Link className="flex text-lg justify-center" to="/signup">
                  <InteractiveHoverButton
                    text="Get Started"
                    className="custom-class"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
          {/* Announcement Banner */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/10 rounded-full px-4 py-2 inline-flex items-center space-x-1">
              <span className="text-white">🎉 Announcement : </span>
              <span className="text-white"> Introducing LTIM Dashboard</span>
              <span className="text-white"> →</span>
            </div>
          </div>

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-6xl tracking-tight font-bold text-white mb-8">
              Data Analytics Dashboard for banking trends, customer behavior and{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(108deg, #0894ff, #ff2e54 70%, #ff9004)",
                  WebkitBackgroundClip: "text", // Ensures compatibility with WebKit browsers
                  WebkitTextFillColor: "transparent", // Ensures text remains transparent
                }}
              >
                AI powered
              </span>{" "}
              market insights.
            </h1>
            <Link className="flex text-lg justify-center" to="/signup">
              <InteractiveHoverButton
                text="Get Started"
                className="custom-class"
              />
            </Link>
          </div>

          {/* Demo Image */}
          <div className="mt-16 rounded-lg overflow-hidden shadow-xl">
            <img src="src/assets/dashboardlayout.png" alt="Demo Interface" />
          </div>
        </div>
      </main>
    </div>
  );
}

export default LandingPage;
