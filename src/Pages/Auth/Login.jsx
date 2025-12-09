import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

// 🔥 Relative paths use kiye hain taaki koi error na aaye
// Ensure karein ki ye files exist karti hain
import { setLoading, setUser, setError } from "../../Store/userSlice.js";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Loader2, ShoppingBag } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state se data le rahe hain
  const { loading, error } = useSelector((state) => state.user);

  // Input fields handle karne ke liye
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading());

    try {
      // 1. Backend API Call
      // VITE_BACKEND_URL .env file se aayega (e.g., http://localhost:5000/api)
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/login`,
        formData,
        {
          withCredentials: true, // Zaroori hai taaki cookie (token) receive ho sake
          headers: { "Content-Type": "application/json" },
        }
      );

      // 2. Success hone par
      if (response.data.success) {
        dispatch(setUser(response.data.user)); // User data Redux me save karo
        navigate("/"); // Home page par bhejo
      }
    } catch (err) {
      // 3. Error aane par
      const errorMessage = err.response?.data?.message || "Login failed!";
      dispatch(setError(errorMessage));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      {/* Login Card UI */}
      <Card className="w-full max-w-md shadow-xl border-t-4 border-blue-600">
        
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <ShoppingBag className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-500">
            Apne account mein login karne ke liye details bharein
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Error Message Alert */}
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md text-center">
                {error}
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                className="focus-visible:ring-blue-600"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="#"
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="focus-visible:ring-blue-600"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t p-6">
          <p className="text-sm text-gray-600">
            Account nahi hai?{" "}
            <Link
              to="/register"
              className="font-semibold text-blue-600 hover:text-blue-500 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>

      </Card>
    </div>
  );
};

export default Login;