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
              <div className="ml-10 flex items-center space-x-2">
                <Link className="flex text-lg justify-center" to="/login">
                  <InteractiveHoverButton
                    text="Login"
                    className="custom-class w-28"
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
          {/* Hero Content */}
          <div className="text-center max-w-5xl mx-auto">
            <h1 className="text-7xl tracking-tight font-bold text-white mb-8">
              Get analytics for banking trends, customer behavior and <br />{" "}
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
