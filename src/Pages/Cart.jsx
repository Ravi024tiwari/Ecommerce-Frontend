import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, increaseQty, decreaseQty, removeFromCart } from "../Store/cartSlice.js"; 
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { formatPrice } from "../Utils/helper.js";
import { Link, useNavigate } from "react-router-dom";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state se data (Safe Fallback)
  const { cartItems = [], loading } = useSelector((state) => state.cart || {}); 
  const { isAuthenticated } = useSelector((state) => state.user || {});

  // Page load hone par Cart fetch karo
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch]);

  // --- Quantity Handlers ---
  
  const handleIncrease = (productId) => {
    dispatch(increaseQty(productId));
  };

  const handleDecrease = (productId, currentQty) => {
    // Backend decrease logic khud remove handle karta hai agar qty 1 ho
    // Phir bhi UI side confirmation ke liye hum check kar sakte hain
    if (currentQty <= 1) {
       if(window.confirm("Are you sure you want to remove this item?")) {
          dispatch(decreaseQty(productId)); // Backend remove kar dega
       }
    } else {
       dispatch(decreaseQty(productId));
    }
  };

  const handleRemove = (productId) => {
     if(window.confirm("Remove this item from cart?")) {
        dispatch(removeFromCart(productId));
     }
  };

  // --- Calculations ---
  
  const validCartItems = Array.isArray(cartItems) ? cartItems : [];

  // Total Price Calculation
  const subTotal = validCartItems.reduce((acc, item) => {
     const price = item.productId?.price || item.priceAtAddTime || 0;
     return acc + (price * item.quantity);
  }, 0);
  
  const tax = subTotal * 0.18;
  const totalPrice = subTotal + tax;

  // --- UI Renders ---

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <ShoppingBag className="h-16 w-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Please Login</h2>
        <Link to="/login"><Button size="lg">Login Now</Button></Link>
      </div>
    );
  }

  if (loading && validCartItems.length === 0) {
    return <div className="h-screen flex items-center justify-center text-slate-500">Loading cart...</div>;
  }

  if (validCartItems.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-slate-50 px-4">
        <ShoppingBag className="h-20 w-20 text-slate-300 mb-4" />
        <h2 className="text-3xl font-black text-slate-900 mb-3">Your Cart is Empty</h2>
        <Link to="/shop"><Button size="lg">Start Shopping</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-8 font-sans">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8 flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-blue-600" /> Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- Cart Items List --- */}
          <div className="lg:col-span-2 space-y-4">
            {validCartItems.map((item) => {
              const product = item.productId || {}; 
              
              return (
                <Card key={product._id || Math.random()} className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                  <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-6">
                    
                    {/* Image */}
                    <div className="h-24 w-24 bg-slate-100 rounded-xl overflow-hidden border border-slate-100 shrink-0">
                      <img 
                        src={product.productImages?.[0] || "https://placehold.co/400"} 
                        alt={product.title} 
                        className="h-full w-full object-cover mix-blend-multiply" 
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center sm:text-left w-full">
                      <h3 className="font-bold text-slate-900 text-lg line-clamp-1 cursor-pointer hover:text-blue-600" onClick={() => navigate(`/product/${product._id}`)}>
                        {product.title || "Unknown Product"}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">{product.category}</p>
                      <p className="text-xl font-black text-slate-900 mt-2">{formatPrice(product.price || item.priceAtAddTime)}</p>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col items-center sm:items-end gap-4">
                      <div className="flex items-center border border-slate-200 rounded-full bg-slate-50">
                        
                        {/* Decrease Button */}
                        <button 
                          onClick={() => handleDecrease(product._id, item.quantity)} 
                          className="p-2 px-3 hover:text-blue-600"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        
                        <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                        
                        {/* Increase Button */}
                        <button 
                          onClick={() => handleIncrease(product._id)} 
                          className="p-2 px-3 hover:text-blue-600"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {/* Remove Button */}
                      <button onClick={() => handleRemove(product._id)} className="text-xs text-red-500 flex items-center gap-1 hover:text-red-700">
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>

                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* --- Order Summary --- */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border-none shadow-xl rounded-2xl bg-white p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6 border-b pb-4">Order Summary</h2>
                
                <div className="space-y-4 text-sm text-slate-600 mb-6">
                  <div className="flex justify-between"><span>Subtotal</span><span className="font-medium text-slate-900">{formatPrice(subTotal)}</span></div>
                  <div className="flex justify-between"><span>Shipping</span><span className="text-green-600 font-bold">Free</span></div>
                  <div className="flex justify-between"><span>Tax (18%)</span><span className="font-medium text-slate-900">{formatPrice(tax)}</span></div>
                </div>

                <div className="border-t pt-4 mb-6 flex justify-between items-end">
                  <span className="text-lg font-bold text-slate-800">Total</span>
                  <span className="text-3xl font-black text-blue-600">{formatPrice(totalPrice)}</span>
                </div>

                <Button 
                  size="lg" 
                  className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold text-lg"
                  onClick={() => navigate("/checkout")}
                >
                  Checkout <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Card>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;