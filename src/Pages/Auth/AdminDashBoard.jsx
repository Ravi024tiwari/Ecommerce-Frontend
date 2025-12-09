import React, { useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
// 🔥 Redux Actions Import
import { setAdminLoading, setDashboardStats, setAdminError } from "../../Store/adminSlice";

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Loader2, DollarSign, ShoppingBag, Users, Package, TrendingUp, Activity } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
} from "recharts";

// Custom CSS (Same as before)
const dashboardStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
  .glass-card {
    background: rgba(30, 41, 59, 0.4);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }
  .gradient-text {
    background: linear-gradient(to right, #818cf8, #22d3ee);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const AdminDashboard = () => {
  const dispatch = useDispatch();
  
  // 🔥 Redux se data le rahe hain (Ab useState ki zaroorat nahi)
  const { stats, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    // Agar stats pehle se Redux mein hain, toh dobara fetch mat karo (Caching Effect)
    // Agar fresh data chahiye har baar, toh if condition hata dena
    if (!stats) {
      fetchStats();
    }
  }, []);

  const fetchStats = async () => {
    dispatch(setAdminLoading()); // Loading ON
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/dashboard-summary`,
        { withCredentials: true }
      );
      if (response.data.success) {
        // 🔥 Data Redux Store mein save kar diya
        dispatch(setDashboardStats(response.data.dashboard));
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      dispatch(setAdminError("Failed to load stats"));
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] p-6 md:p-10 font-sans text-slate-200">
      <style>{dashboardStyles}</style>
      
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Dashboard <span className="gradient-text">Overview</span>
            </h1>
            <p className="text-slate-400 mt-2">Real-time business insights & analytics.</p>
          </div>
          <Button onClick={fetchStats} variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
             Refresh Data
          </Button>
        </div>

        {/* --- 1. Stats Cards --- */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard 
            title="Total Revenue" 
            value={`₹${stats?.stats?.revenueLast30Days?.toLocaleString() || 0}`} 
            icon={DollarSign} 
            gradient="from-indigo-500 to-purple-600"
            delay="0s"
          />
          <StatsCard 
            title="Total Orders" 
            value={stats?.stats?.totalOrders || 0} 
            icon={ShoppingBag} 
            gradient="from-blue-500 to-cyan-500"
            delay="0.1s"
          />
          <StatsCard 
            title="Total Products" 
            value={stats?.stats?.totalProducts || 0} 
            icon={Package} 
            gradient="from-amber-500 to-orange-600"
            delay="0.2s"
          />
          <StatsCard 
            title="Total Users" 
            value={stats?.stats?.totalUsers || 0} 
            icon={Users} 
            gradient="from-emerald-500 to-teal-600"
            delay="0.3s"
          />
        </div>

        {/* --- 2. Charts Section --- */}
        <div className="grid gap-6 md:grid-cols-7 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          
          {/* Revenue Area Chart */}
          <Card className="col-span-4 glass-card border-none shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-800 pb-4">
              <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-400" /> Revenue Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pl-0">
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={formatGraphData(stats?.salesGraph)}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#94a3b8" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      dy={10}
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `₹${value/1000}k`} 
                      dx={-10}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #475569', color: '#fff' }}
                      itemStyle={{ color: '#e2e8f0' }}
                      formatter={(value) => [`₹${value}`, "Revenue"]}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Orders Bar Chart */}
          <Card className="col-span-3 glass-card border-none shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-800 pb-4">
              <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <Activity className="h-5 w-5 text-orange-400" /> Order Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pl-0">
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={formatGraphData(stats?.salesGraph)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="date" hide />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{fill: '#334155', opacity: 0.4}}
                      contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #475569', color: '#fff' }}
                    />
                    <Bar dataKey="orders" fill="#fb923c" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* --- 3. Status Grid --- */}
        <div className="grid gap-6 md:grid-cols-3 animate-fade-in" style={{ animationDelay: '0.6s' }}>
           <StatusCard label="Pending Orders" count={stats?.stats?.pendingOrders} color="bg-yellow-500/10 text-yellow-400 border-yellow-500/20" iconColor="bg-yellow-500/20" />
           <StatusCard label="Delivered Successfully" count={stats?.stats?.deliveredOrders} color="bg-emerald-500/10 text-emerald-400 border-emerald-500/20" iconColor="bg-emerald-500/20" />
           <StatusCard label="Critical Low Stock" count={stats?.stats?.lowStockCount} color="bg-rose-500/10 text-rose-400 border-rose-500/20" iconColor="bg-rose-500/20" />
        </div>

      </div>
    </div>
  );
};

// Sub-Components (Same as before, just kept inside for portability)
const StatsCard = ({ title, value, icon: Icon, gradient, delay }) => (
  <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 animate-fade-in group" style={{ animationDelay: delay }}>
    <div className={`absolute top-0 right-0 p-4 opacity-20 bg-gradient-to-br ${gradient} w-24 h-24 rounded-bl-full group-hover:opacity-30 transition-opacity`}></div>
    <div className="flex items-center justify-between relative z-10">
      <div>
        <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg shadow-black/30`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  </div>
);

const StatusCard = ({ label, count, color, iconColor }) => (
  <div className={`flex items-center justify-between p-6 rounded-2xl border ${color} shadow-lg transition-transform hover:scale-[1.02]`}>
     <div className="flex items-center gap-4">
       <div className={`p-2.5 rounded-xl ${iconColor}`}>
         <Package className="h-6 w-6" />
       </div>
       <span className="font-semibold text-lg tracking-wide">{label}</span>
     </div>
     <span className="text-3xl font-bold">{count || 0}</span>
  </div>
);

const formatGraphData = (graphData) => {
  if (!graphData) return [];
  return graphData.dates.map((date, index) => ({
    date: new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    revenue: graphData.revenue[index] || 0,
    orders: graphData.orders[index] || 0,
  }));
};

// Button Component Import Missing tha, isliye yahan add kar raha hu
import { Button } from "../../components/ui/button"; 

export default AdminDashboard;