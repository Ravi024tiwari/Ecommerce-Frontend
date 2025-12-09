import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Outlet ka matlab hai yahan child routes (Login/Register) render honge */}
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;