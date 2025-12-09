import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
// 🔥 FIX: Relative paths for Redux & Components (Safe approach)
import { setLoading, setUser, setError } from "../../Store/userSlice.js";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Loader2, ShieldCheck } from "lucide-react";

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.user);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading());
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/admin/login`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.success) {
        dispatch(setUser(response.data.admin));
        navigate("/admin/dashboard");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Admin access denied!";
      dispatch(setError(errorMessage));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      {/* Dark background for admin feel */}
      <Card className="w-full max-w-md border-slate-800 bg-slate-900 text-slate-50 shadow-2xl">
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-slate-800 rounded-full border border-slate-700">
              <ShieldCheck className="h-10 w-10 text-emerald-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-wider text-white">
            ADMIN PORTAL
          </CardTitle>
          <CardDescription className="text-slate-400">
            Secure Access Area. Authorized Personnel Only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-900/20 border border-red-900/50 rounded-md text-center">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">
                Admin Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@store.com"
                required
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" classname="text-slate-200">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-slate-800 border-slate-700 text-white focus-visible:ring-emerald-500"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying Credentials...
                </>
              ) : (
                "Access Dashboard"
              )}
            </Button>
          </form>
        </CardContent>
        <div className="pb-6 text-center">
            <p className="text-xs text-slate-600">Restricted System • Logged & Monitored</p>
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin;