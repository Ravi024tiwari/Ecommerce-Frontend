import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyOrders } from "../Store/orderSlice.js"; 
import { Card, CardContent } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button";
import { Loader2, Package, ShoppingBag, Calendar, MapPin, ChevronRight, Box } from "lucide-react";
import { formatPrice } from "../Utils/helper.js";
import { Link, useNavigate } from "react-router-dom";

const MyOrders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders = [], loading } = useSelector((state) => state.order || {});
  const { user } = useSelector((state) => state.user || {});

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchMyOrders());
    }
  }, [dispatch, user]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-100">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Fetching your orders...</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center bg-slate-100 px-4">
        <div className="bg-white p-6 rounded-full shadow-sm mb-4">
           <Package className="h-16 w-16 text-slate-300" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">No Orders Yet</h2>
        <p className="text-slate-500 mb-6 text-center">Looks like you haven't ordered anything yet.</p>
        <Link to="/shop">
           <Button size="lg" className="rounded-full px-8 bg-slate-900 text-white hover:bg-blue-600 transition-all">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 md:px-8 font-sans pb-24">
      <div className="container mx-auto max-w-4xl">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200">
            <ShoppingBag className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">My Orders</h1>
            <p className="text-sm text-slate-500">Track and manage your recent purchases</p>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order._id} className="border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white overflow-hidden rounded-2xl group ring-1 ring-slate-200">
              
              {/* Order Header */}
              <div className="bg-slate-50/50 border-b border-slate-100 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    {/* Order Number from Backend */}
                    <span className="font-bold text-slate-800 text-sm md:text-base font-mono">
                      {order.orderNumber || `#${order._id.slice(-6).toUpperCase()}`}
                    </span>
                    
                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      order.orderStatus === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                      order.orderStatus === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-blue-50 text-blue-600 border-blue-200'
                    }`}>
                      {order.orderStatus || 'Processing'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(order.createdAt).toLocaleDateString()}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="flex items-center gap-1.5"><Box className="h-3.5 w-3.5" /> {order.items?.length} Items</span>
                  </div>
                </div>
                
                <div className="text-left sm:text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Total Amount</p>
                  <p className="text-xl font-black text-slate-900">{formatPrice(order.totalAmount)}</p>
                </div>
              </div>

              {/* Order Items */}
              <CardContent className="p-0">
                <div className="divide-y divide-slate-50">
                  {order.items?.map((item, idx) => {
                    // Backend sends productId populated inside items array
                    const product = item.productId || {};
                    
                    return (
                      <div key={idx} className="p-5 flex items-center gap-5 hover:bg-slate-50/50 transition-colors group/item">
                        
                        {/* Product Image */}
                        <div className="h-16 w-16 bg-white rounded-xl overflow-hidden border border-slate-100 shrink-0 shadow-sm">
                          <img 
                            src={product.productImages?.[0] || "https://placehold.co/100"} 
                            alt={product.title || "Product"} 
                            className="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover/item:opacity-100 transition-opacity"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h4 
                             className="font-bold text-slate-800 text-sm md:text-base truncate cursor-pointer hover:text-blue-600 transition-colors"
                             onClick={() => navigate(`/product/${product._id}`)}
                          >
                            {product.title || "Product Unavailable"}
                          </h4>
                          <div className="flex items-center gap-3 mt-1.5">
                             <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Qty: {item.quantity}</span>
                             {/* Individual Item Price */}
                             <span className="text-xs font-semibold text-slate-700">
                                {formatPrice(item.priceAtOrder || product.price)}
                             </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer / Address Preview */}
                <div className="bg-slate-50/30 px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-start gap-2 text-xs text-slate-500 bg-white px-3 py-2 rounded-lg border border-slate-100 shadow-sm w-full sm:w-auto">
                    <MapPin className="h-3.5 w-3.5 text-blue-500 mt-0.5" />
                    <div className="max-w-[250px]">
                        <span className="font-bold text-slate-700 block mb-0.5">{order.shippingAddress?.name}</span>
                        <span className="line-clamp-1 leading-tight text-slate-500">
                          {order.shippingAddress?.street}, {order.shippingAddress?.city}
                        </span>
                    </div>
                  </div>
                  
                  {/* View Details Button */}
                  <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-4 rounded-full border border-blue-100">
                    Track Order <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;