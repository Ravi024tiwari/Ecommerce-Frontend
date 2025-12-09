import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../Store/userSlice.js"; // Path verify kar lena (../store vs ../Store)
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  LogOut,
  Star // 🔥 Added Star Icon for Reviews
} from "lucide-react";

const AdminSidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  // Menu Items ka Array
  const menuItems = [
    { path: "/admin/dashboard", name: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { path: "/admin/products", name: "Products", icon: <Package size={20} /> },
    { path: "/admin/orders", name: "Orders", icon: <ShoppingBag size={20} /> },
    { path: "/admin/users", name: "Users", icon: <Users size={20} /> },
    // 🔥 NEW: Reviews Link Added
    { path: "/admin/reviews", name: "Reviews", icon: <Star size={20} /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col fixed left-0 top-0 border-r border-slate-800 z-50">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <h2 className="text-xl font-black tracking-wider text-white">
          Shop<span className="text-blue-500">Admin</span>
        </h2>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item) => {
          // startsWith use kiya taaki nested routes par bhi active rahe
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className={`${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`}>
                {item.icon}
              </span>
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;