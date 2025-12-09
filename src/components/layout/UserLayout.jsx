import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../common/NavBar.jsx";
import Footer from "../common/Footer.jsx"; // Ensure Footer exists in common folder

const UserLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-blue-400">
      {/* Top par Navbar fix */}
      <Navbar />
      
      {/* Beech mein Page Content (Home, Cart, etc.) */}
      <main className="grow ">
        <Outlet />
      </main>

      {/* Bottom par Footer fix */}
      <Footer />
    </div>
  );
};

export default UserLayout;