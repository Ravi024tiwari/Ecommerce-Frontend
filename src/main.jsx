import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

// Redux & Persist Imports
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./Store/store.js"; // 🔥 FIX: Path corrected (Store -> store)

// React Router Imports
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

// Pages Imports
// 🔥 FIX: Correct Paths (Pages -> pages) & Added AdminDashboard
import Home from "./Pages/Home.jsx";
import Login from "./Pages/auth/Login.jsx";
import Register from "./Pages/Auth/Register.jsx";
import AdminLogin from "./Pages/Auth/AdminLogin.jsx";
import AdminDashboard from "./Pages/Auth/AdminDashBoard.jsx";
import AdminProducts from "./Pages/AdminProduct.jsx";
import Shop from "./Pages/Shop.jsx";
import AdminAddProduct from "./Pages/AdminAddProduct.jsx";
import Cart from "./Pages/Cart.jsx";
import Checkout from "./Pages/CheckOut.jsx";
import OrderSuccess from "./Pages/OrderSuccess.jsx";
import MyOrders from "./Pages/MyOrders.jsx";
import Profile from "./Pages/UpdateProfile.jsx";
import ProductDetails from "./Pages/ProductDetails";

// Layout Imports
import AuthLayout from "./components/layout/AuthLayout.jsx";
import UserLayout from "./components/layout/UserLayout.jsx";
import AdminLayout from "./components/layout/AdminLayout.jsx";
import AdminOrders from "./Pages/AdminOrderTable.jsx";
import AdminUsers from "./Pages/AdminUser.jsx";
import Wishlist from "./Pages/WishList.jsx";
import AdminReviews from "./Pages/AdminReview.jsx";
import { Check } from "lucide-react";

// --- 🔥 ROUTE GUARDS (Protection Logic) ---

// 1. Public Guard: User login hai to Home bhejo
const PublicGuard = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.user);
  return isAuthenticated ? <Navigate to="/" replace /> : children;
};

// 2. Admin Guard: Sirf Admin allow, baaki login par
const AdminGuard = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.user);

  // 🔥 SMART CHECK: Refresh ke baad agar flag false ho par data ho, toh verify karo
  const isActuallyAdmin = (isAuthenticated || user) && user?.role === "admin";

  if (!isActuallyAdmin) {
    // Agar admin nahi hai, toh check karo login hai ya nahi
    if (isAuthenticated || user) {
      return <Navigate to="/" replace />; // Normal user ko Home bhejo
    }
    return <Navigate to="/admin/login" replace />; // Guest ko Admin Login bhejo
  }

  return children;
};

// 3. Admin Public Guard: Admin login hai to Dashboard bhejo
const AdminPublicGuard = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const isAdmin = isAuthenticated && user?.role === "admin";
  return isAdmin ? <Navigate to="/admin/dashboard" replace /> : children;
};

// --- 🛣️ ROUTER CONFIGURATION ---
const router = createBrowserRouter([
  {
    // 🔥 FIX: UserLayout wrap kiya taaki Navbar/Footer dikhe
    element: <UserLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      { path: "/shop",
        element: <Shop /> 
      }, // 🔥 Added Shop Page
      {
        path:'/product/:id',
        element:<ProductDetails/>
      },
      {
        path: "/cart",
        element: <Cart />, 
      },
      {
        path:"/checkout",
        element:<Checkout/>
      },
      {
         path: "/order-success",
        element: <OrderSuccess /> 
      },
      { 
        path: "/profile/orders", 
        element: <MyOrders />
      },
     { 
        path: "/profile", 
        element:<Profile />
     },
     { 
       path: "/wishlist", 
       element: <Wishlist />
     },
    ],
  },
  {
    // Auth Routes (Login/Register) wrapped in AuthLayout
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: (
          <PublicGuard><Login /></PublicGuard>
        ),
      },
      {
        path: "/register",
        element: (
          <PublicGuard><Register /></PublicGuard>
        ),
      },
    ],
  },
  {
    path: "/admin/login",
    element: (
      <AdminPublicGuard><AdminLogin /></AdminPublicGuard>
    ),
  },
  {
    // 🔥 FIX: Admin Dashboard route add kiya
    element: <AdminLayout />,
    children: [
      {
        path: "/admin/dashboard",
        element: (
          <AdminGuard> <AdminDashboard /></AdminGuard>
        ),
      },
      { 
        path: "/admin/products", 
        element: <AdminGuard><AdminProducts /></AdminGuard> // 🔥 Product List
      },
      { 
        path: "/admin/products/add", 
        element: <AdminGuard><AdminAddProduct /></AdminGuard> // 🔥 Create Product
      },
      { 
        path: "/admin/products/edit/:id", 
        element: <AdminGuard><AdminAddProduct /></AdminGuard> // 🔥 update Product
      },
      { 
        path: "/admin/orders",
        element: <AdminGuard><AdminOrders /></AdminGuard>
      },
      { 
        path: "/admin/users",
        element: <AdminGuard><AdminUsers /></AdminGuard>
      },
      {
        path:"/admin/reviews",
        element:<AdminGuard><AdminReviews/></AdminGuard>
      }
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {/* 🔥 Ab hum RouterProvider use kar rahe hain */}
        <RouterProvider router={router} />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);