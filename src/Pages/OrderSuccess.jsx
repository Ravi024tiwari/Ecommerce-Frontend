import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { resetCurrentOrder } from "../Store/orderSlice"; // 🔥 Updated Import
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { CheckCircle, ShoppingBag, ArrowRight, Package } from "lucide-react";

const OrderSuccess = () => {
  const dispatch = useDispatch();
  const { currentOrder } = useSelector((state) => state.order || {});
  
  // Cleanup: Jab user page se jaye, toh current order clear kar do
  useEffect(() => {
    return () => {
      dispatch(resetCurrentOrder());
    };
  }, [dispatch]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-slate-50/50 px-4 py-10">
      
      {/* Animated Card */}
      <Card className="max-w-md w-full border-none shadow-2xl rounded-3xl overflow-hidden bg-white p-8 animate-in zoom-in duration-500 ring-1 ring-slate-100">
        <CardContent className="flex flex-col items-center space-y-6 pt-4">
          
          {/* Success Icon Animation */}
          <div className="relative mb-2">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75 duration-1000"></div>
            <div className="relative bg-green-50 p-6 rounded-full border border-green-100">
              <CheckCircle className="h-16 w-16 text-green-600 drop-shadow-sm" />
            </div>
          </div>

          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order Confirmed!</h1>
            <p className="text-slate-500 font-medium">Thank you for shopping with us.</p>
          </div>

          {/* Order ID Box */}
          {currentOrder ? (
            <div className="bg-slate-50 px-6 py-4 rounded-xl border border-slate-200 w-full text-center">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Order Reference ID</p>
              <p className="text-lg font-mono font-bold text-blue-600 break-all select-all">
                #{currentOrder}
              </p>
            </div>
          ) : (
            <div className="bg-amber-50 px-6 py-3 rounded-lg border border-amber-100 w-full text-center">
               <p className="text-sm text-amber-700 font-medium">Order details are being processed...</p>
            </div>
          )}

          <p className="text-sm text-slate-500 leading-relaxed px-2 text-center">
            Your order has been placed successfully. You will receive an email confirmation shortly with tracking details.
          </p>

          <div className="w-full h-px bg-slate-100 my-2"></div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 w-full">
            <Link to="/shop" className="w-full">
              <Button className="w-full h-12 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-md shadow-lg hover:shadow-blue-200 transition-all flex items-center justify-center gap-2">
                Continue Shopping <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            
            <Link to="/profile/orders" className="w-full">
              <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-semibold flex items-center justify-center gap-2">
                <Package className="h-4 w-4" /> View Order History
              </Button>
            </Link>
          </div>

        </CardContent>
      </Card>

      {/* Footer Note */}
      <div className="mt-8 flex items-center gap-2 text-slate-400 text-sm bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
        <ShoppingBag className="h-4 w-4" />
        <span>Questions? Contact <a href="#" className="text-blue-600 hover:underline">Support</a></span>
      </div>

    </div>
  );
};

export default OrderSuccess;