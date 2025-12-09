import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom"; // useSearchParams added
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { logoutUser } from "../../Store/userSlice.js";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { 
  ShoppingCart, Search, LogOut, X, Package, 
  ChevronDown, LayoutDashboard, User, Heart 
} from "lucide-react"; 
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const navStyles = `
  .nav-glass {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(226, 232, 240, 0.8);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
  }
  .nav-transparent {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  }
  .logo-gradient {
    background: linear-gradient(135deg, #1e293b 0%, #2563eb 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
`;

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.user || {});
  const { cartItems } = useSelector((state) => state.cart || { cartItems: [] });
  
  const validCartItems = Array.isArray(cartItems) ? cartItems : [];
  const totalItems = validCartItems.reduce((total, item) => total + (item.quantity || 1), 0);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // URL se query padhne ke liye
  
  // Search States
  const [query, setQuery] = useState(searchParams.get("search") || ""); // Default to URL value
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) setShowSuggestions(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update query if URL changes (e.g., Back button)
  useEffect(() => {
    setQuery(searchParams.get("search") || "");
  }, [searchParams]);

  // Search API Logic (Debounced)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) { setSuggestions([]); return; }
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/search-suggestions?keyword=${query}`);
        if (response.data.success) {
          setSuggestions(response.data.suggestions);
          setShowSuggestions(true);
        }
      } catch (error) { console.error("Search API Error:", error); }
    };
    const timeoutId = setTimeout(() => { if (query && showSuggestions) fetchSuggestions(); }, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setShowProfileMenu(false);
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) { 
        setShowSuggestions(false); 
        navigate(`/shop?search=${query}`); // 🔥 Redirect to Shop
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    navigate(`/shop?search=${suggestion}`); // 🔥 Redirect to Shop
  };

  return (
    <>
      <style>{navStyles}</style>
      <nav className={`sticky top-0 z-50 w-full transition-all duration-500 ease-in-out ${scrolled ? "nav-glass py-3" : "nav-transparent py-5"}`}>
        <div className="container mx-auto flex items-center justify-between px-6">
          
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-blue-700 text-white shadow-lg transform group-hover:scale-105 transition-all">
              <span className="font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-black tracking-tight logo-gradient">ShopEcom</span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex w-1/3 items-center relative group" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <Input 
                type="text" 
                placeholder="Search products..." 
                className="w-full pl-11 pr-10 h-11 bg-slate-100/80 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-full transition-all text-slate-700"
                value={query} 
                onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
              />
              <Search className="absolute left-4 top-3 h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
              {query && (
                <button type="button" onClick={() => { setQuery(""); setSuggestions([]); }} className="absolute right-3 top-3 text-slate-400 hover:text-red-500 bg-slate-200 rounded-full p-0.5">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-14 left-0 w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 ring-1 ring-slate-900/5">
                <div className="py-2">
                  <p className="px-5 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Suggested</p>
                  {suggestions.map((item, index) => (
                    <div key={index} onClick={() => handleSuggestionClick(item)} className="px-5 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 text-slate-700 hover:text-blue-600 border-b border-slate-50 last:border-none">
                      <Search className="h-4 w-4 text-slate-400" />
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Icons & Profile */}
          <div className="flex items-center gap-2 md:gap-4">
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative hover:bg-slate-100 rounded-full w-11 h-11 group">
                <ShoppingCart className="h-6 w-6 text-slate-600 group-hover:text-blue-600 transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white ring-2 ring-white shadow-md">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <div className="flex items-center gap-3 pl-2 md:pl-4 md:border-l border-slate-200 ml-2 cursor-pointer group p-1 rounded-full hover:bg-slate-50" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                  <Avatar className="h-9 w-9 border border-slate-200 shadow-sm group-hover:ring-2 group-hover:ring-blue-100">
                    <AvatarImage src={user?.profileImage} />
                    <AvatarFallback className="bg-slate-800 text-white font-bold text-xs">{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-sm leading-tight">
                    <p className="font-bold text-slate-800 tracking-tight">{user?.name?.split(" ")[0]}</p>
                    <span className="text-[10px] text-slate-400 font-medium">{user?.role === 'admin' ? 'ADMIN' : 'Member'}</span>
                  </div>
                  <ChevronDown className={`hidden md:block h-4 w-4 text-slate-400 transition-transform ${showProfileMenu ? "rotate-180" : ""}`} />
                </div>

                {showProfileMenu && (
                  <div className="absolute right-0 top-14 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-5 py-3 border-b border-slate-50 mb-1">
                       <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                       <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <div className="px-2 space-y-1">
                      {user?.role === "admin" && <Link to="/admin/dashboard" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl"><LayoutDashboard className="h-4 w-4" /> Dashboard</Link>}
                      <Link to="/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl"><User className="h-4 w-4" /> Profile</Link>
                      <Link to="/wishlist" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl"><Heart className="h-4 w-4" /> My Wishlist</Link>
                      <Link to="/profile/orders" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl"><Package className="h-4 w-4" /> My Orders</Link>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-50 px-2">
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl"><LogOut className="h-4 w-4" /> Logout</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2 md:gap-3 items-center">
                <Link to="/login"><Button variant="ghost" className="font-bold text-slate-600 hover:text-blue-600">Login</Button></Link>
                <Link to="/register"><Button className="rounded-full bg-slate-900 text-white hover:bg-blue-700 px-5 shadow-lg">Sign Up</Button></Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;