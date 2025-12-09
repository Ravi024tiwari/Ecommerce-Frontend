import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWishlist } from "../Store/wishListSlice.js"; 
import ProductCard from "../components/product/ProductCard";
import { Button } from "../components/ui/button";
import { Loader2, Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Wishlist = () => {
  const dispatch = useDispatch();
  const { wishlistItems = [], loading } = useSelector((state) => state.wishlist || {});
  const { user } = useSelector((state) => state.user || {});

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, user]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-6 rounded-full shadow-sm mb-4">
           <Heart className="h-16 w-16 text-slate-300" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Your Wishlist is Empty</h2>
        <p className="text-slate-500 mb-6 text-center">Save items you love to buy later.</p>
        <Link to="/shop">
           <Button size="lg" className="rounded-full px-8 bg-slate-900 text-white hover:bg-blue-600">Explore Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4 md:px-8 font-sans">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-red-50 rounded-xl text-red-500 border border-red-100">
            <Heart className="h-6 w-6 fill-red-500" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Wishlist ({wishlistItems.length})</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
             // Backend kabhi-kabhi null bhej sakta hai agar product delete ho gaya ho
             product ? <ProductCard key={product._id} product={product} /> : null
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;