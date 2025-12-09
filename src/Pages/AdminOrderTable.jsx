import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllOrdersAdmin, updateOrderStatus } from "../Store/orderSlice.js";
import { Card } from "../components/ui/card.jsx";
import { Loader2, Search, Calendar, ChevronDown, User, Box } from "lucide-react";
import { formatPrice } from "../Utils/helper.js";

const AdminOrders = () => {
  const dispatch = useDispatch();
  const { adminOrders = [], loading } = useSelector((state) => state.order || {});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchAllOrdersAdmin());
  }, [dispatch]);

  const handleStatusChange = async (orderId, newStatus) => {
    // Instant feedback ke liye confirm box
    if(window.confirm(`Change order status to "${newStatus}"?`)) {
       await dispatch(updateOrderStatus(orderId, newStatus));
    }
  };

  // Filter Logic: Order ID ya User Name se search
  const filteredOrders = adminOrders.filter(order => 
    order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Status Badge Colors
  const getStatusColor = (status) => {
    switch (status) {
      case "delivered": return "bg-green-100 text-green-700 border-green-200";
      case "shipped": return "bg-purple-100 text-purple-700 border-purple-200";
      case "cancelled": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-blue-50 text-blue-600 border-blue-200";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Orders</h1>
          <p className="text-slate-500">Manage and track all customer orders.</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by ID or Customer..." 
            className="pl-10 pr-4 py-2.5 w-full border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Orders Table */}
      <Card className="border-none shadow-xl rounded-2xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-bold">Order ID</th>
                <th className="px-6 py-4 font-bold">Customer</th>
                <th className="px-6 py-4 font-bold">Items</th>
                <th className="px-6 py-4 font-bold">Total</th>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold">Payment</th>
                <th className="px-6 py-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="7" className="text-center py-12"><Loader2 className="animate-spin h-8 w-8 mx-auto text-blue-600" /></td></tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/50 transition-colors group">
                    
                    {/* 1. Order ID */}
                    <td className="px-6 py-4">
                      <span className="font-mono font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">
                        {order.orderNumber || `#${order._id.slice(-6).toUpperCase()}`}
                      </span>
                    </td>
                    
                    {/* 2. Customer Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                          {order.userId?.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{order.userId?.name || "Unknown"}</p>
                          <p className="text-xs text-slate-500">{order.userId?.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* 3. Items Summary */}
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2 overflow-hidden">
                        {order.items?.slice(0, 3).map((item, idx) => (
                          <img 
                            key={idx}
                            src={item.productId?.productImages?.[0]} 
                            alt="product"
                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover bg-white"
                            title={item.productId?.title}
                          />
                        ))}
                        {order.items?.length > 3 && (
                          <div className="h-8 w-8 rounded-full bg-slate-100 ring-2 ring-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 4. Total Amount */}
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {formatPrice(order.totalAmount)}
                    </td>

                    {/* 5. Date */}
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    {/* 6. Payment Status */}
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                         order.paymentInfo?.status === 'paid' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                      }`}>
                         {order.paymentInfo?.status?.toUpperCase() || "PENDING"}
                      </span>
                    </td>

                    {/* 7. Order Status Dropdown */}
                    <td className="px-6 py-4">
                      <div className="relative">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className={`appearance-none w-32 pl-3 pr-8 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${getStatusColor(order.orderStatus)}`}
                          disabled={order.orderStatus === "cancelled"}
                        >
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1.5 h-4 w-4 text-slate-500 pointer-events-none opacity-50" />
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-16 text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                       <Box className="h-10 w-10 opacity-20" />
                       <p>No orders found matching your search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminOrders;