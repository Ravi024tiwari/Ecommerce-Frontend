import React from "react";
import { Outlet } from "react-router-dom";
// 🔥 FIX: Import path correct kiya aur Alias (@) use kiya
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import AdminSidebar from "../../Pages/AdminSideBar.jsx";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-100">
      
      {/* 1. Navbar (Fixed Top) */}
      {/* Note: Agar Navbar sticky hai, toh wo content ke upar rahega */}
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      {/* 2. Sidebar (Fixed Left) */}
      {/* Navbar ki height (h-16 = 4rem) ke neeche sidebar shuru hoga */}
      <div className="fixed top-16 left-0 h-[calc(100vh-4rem)] z-40 hidden md:block">
        <AdminSidebar />
      </div>

      {/* 3. Main Content Wrapper */}
      {/* pt-16: Navbar ke liye jagah chhodi */}
      {/* md:ml-64: Sidebar ke liye left mein jagah chhodi */}
      <div className="flex-1 flex flex-col min-h-screen pt-16 md:ml-64 transition-all duration-300">
        
        {/* Content Area */}
        <main className="grow p-6 overflow-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <Footer />
      </div>

    </div>
  );
};

export default AdminLayout;